import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CAR_TYPES } from '../data/carTypes';
import { adjustInventory, fetchAdminJobs, fetchInventory } from '../services/api';

const blankForm = {
  action: 'receive',
  productMode: 'existing',
  carType: 'Toyota',
  partId: '',
  partName: '',
  unitPrice: '',
  quantity: '',
  repairJobId: '',
};

function money(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value ?? '—');
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Inventory() {
  const [parts, setParts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blankForm);

  const [filterType, setFilterType] = useState('All');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [inventoryData, jobsData] = await Promise.all([fetchInventory(), fetchAdminJobs()]);
      setParts(inventoryData.parts ?? []);
      setJobs(jobsData.jobs ?? []);
    } catch (err) {
      setError(err.message || 'Unable to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const partsForCarType = useMemo(
    () => parts.filter((part) => part.carType === form.carType),
    [parts, form.carType]
  );

  const partsByCarType = useMemo(() => {
    const groups = {};
    for (const type of CAR_TYPES) {
      groups[type] = [];
    }
    for (const part of parts) {
      if (!groups[part.carType]) groups[part.carType] = [];
      groups[part.carType].push(part);
    }
    const entries = Object.entries(groups).filter(([, list]) => list.length > 0);
    if (filterType === 'All') return entries;
    return entries.filter(([type]) => type === filterType);
  }, [parts, filterType]);

  const typeCounts = useMemo(() => {
    const counts = { All: parts.length };
    for (const type of CAR_TYPES) counts[type] = 0;
    for (const part of parts) {
      counts[part.carType] = (counts[part.carType] || 0) + 1;
    }
    return counts;
  }, [parts]);

  const updateField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === 'productMode' && value === 'new') {
        next.partId = '';
      }

      if (field === 'carType') {
        next.partId = '';
        next.partName = '';
        next.unitPrice = '';
      }

      if (field === 'partId' && value) {
        const selected = parts.find((part) => part.id === value);
        if (selected) {
          next.partName = selected.partName;
          next.carType = selected.carType;
          next.unitPrice = String(Number(selected.retailPrice));
        }
      }

      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (!form.quantity || Number(form.quantity) <= 0) {
        throw new Error('Enter the quantity manually.');
      }
      if (form.unitPrice === '' || Number.isNaN(Number(form.unitPrice))) {
        throw new Error('Enter the product price manually.');
      }
      if (!form.carType) {
        throw new Error('Select a car type.');
      }
      if (form.productMode === 'existing' && !form.partId) {
        throw new Error('Pick a product for this car type, or switch to typing a new name.');
      }
      if (form.productMode === 'new' && !form.partName.trim()) {
        throw new Error('Type the product name.');
      }

      const result = await adjustInventory({
        action: form.action,
        partId: form.productMode === 'existing' ? form.partId : undefined,
        partName: form.productMode === 'new' ? form.partName.trim() : form.partName,
        carType: form.carType,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
        repairJobId: form.action === 'use' && form.repairJobId ? form.repairJobId : undefined,
      });

      const inventoryData = await fetchInventory();
      setParts(inventoryData.parts ?? []);

      const verb = form.action === 'receive' ? 'Added' : 'Deducted';
      setSuccess(
        `${verb} ${result.quantity} × ${result.part.partName} (${result.part.carType}) at ${money(result.unitPrice)}. On hand now: ${result.part.quantity}.`
      );
      setForm({
        ...blankForm,
        action: form.action,
        productMode: form.productMode,
        carType: result.part.carType || form.carType,
      });
    } catch (err) {
      setError(err.message || 'Unable to update inventory.');
    } finally {
      setSaving(false);
    }
  };

  const activeJobs = jobs.filter((job) =>
    ['PENDING', 'DIAGNOSING', 'PARTS_ON_ORDER', 'IN_PROGRESS'].includes(job.status)
  );

  return (
    <div className="ops-page">
      <div className="page-intro">
        <span className="page-kicker">Staff · Inventory</span>
        <h2>Parts in / parts out</h2>
        <p>
          Every product belongs to a car type. Pick the vehicle type first, then choose or type the product, price, and
          quantity.
        </p>
        <p>
          <Link className="text-link" to="/dashboard">
            ← Back to dashboard
          </Link>
        </p>
      </div>

      {loading ? <p className="page-kicker">Loading inventory…</p> : null}
      {error ? <p className="track-error">{error}</p> : null}
      {success ? <p className="track-success">{success}</p> : null}

      <form className="inventory-form panel panel-accent" onSubmit={handleSubmit}>
        <h3 className="inventory-form__title">Record stock movement</h3>

        <div className="inventory-form__grid">
          <label className="ticket-field">
            <span>Movement</span>
            <select value={form.action} onChange={(event) => updateField('action', event.target.value)} disabled={saving}>
              <option value="receive">Parts brought in (add to stock)</option>
              <option value="use">Parts used (deduct from stock)</option>
            </select>
          </label>

          <label className="ticket-field">
            <span>Car type</span>
            <select
              value={form.carType}
              onChange={(event) => updateField('carType', event.target.value)}
              disabled={saving}
              required
            >
              {CAR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="ticket-field">
            <span>Product entry</span>
            <select
              value={form.productMode}
              onChange={(event) => updateField('productMode', event.target.value)}
              disabled={saving}
            >
              <option value="existing">Pick from {form.carType} products</option>
              <option value="new">Type new product name</option>
            </select>
          </label>

          {form.productMode === 'existing' ? (
            <label className="ticket-field inventory-form__wide">
              <span>Product name ({form.carType})</span>
              <select
                value={form.partId}
                onChange={(event) => updateField('partId', event.target.value)}
                disabled={saving}
                required
              >
                <option value="">Select a {form.carType} product…</option>
                {partsForCarType.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.partName} (on hand: {part.quantity})
                  </option>
                ))}
              </select>
              {partsForCarType.length === 0 ? (
                <small className="field-hint">No {form.carType} products yet — switch to “Type new product name”.</small>
              ) : null}
            </label>
          ) : (
            <label className="ticket-field inventory-form__wide">
              <span>Product name ({form.carType})</span>
              <input
                type="text"
                required
                placeholder={`e.g. Front brake pads for ${form.carType}`}
                value={form.partName}
                onChange={(event) => updateField('partName', event.target.value)}
                disabled={saving}
              />
            </label>
          )}

          <label className="ticket-field">
            <span>Unit price (UGX)</span>
            <input
              type="number"
              min="0"
              step="1"
              required
              placeholder="Enter price"
              value={form.unitPrice}
              onChange={(event) => updateField('unitPrice', event.target.value)}
              disabled={saving}
            />
          </label>

          <label className="ticket-field">
            <span>Quantity</span>
            <input
              type="number"
              min="1"
              step="1"
              required
              placeholder="Enter quantity"
              value={form.quantity}
              onChange={(event) => updateField('quantity', event.target.value)}
              disabled={saving}
            />
          </label>

          {form.action === 'use' ? (
            <label className="ticket-field inventory-form__wide">
              <span>Link to repair (optional)</span>
              <select
                value={form.repairJobId}
                onChange={(event) => updateField('repairJobId', event.target.value)}
                disabled={saving}
              >
                <option value="">No job — just deduct stock</option>
                {activeJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.vehicle?.licensePlate || 'Job'} · {job.vehicle?.make} {job.vehicle?.model} · {job.status}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <button type="submit" className="button button-primary" disabled={saving}>
          {saving ? 'Saving…' : form.action === 'receive' ? 'Add to stock' : 'Deduct from stock'}
        </button>
      </form>

      <div className="garage-section">
        <header className="section-head">
          <h2>Stock by car type</h2>
          <p>Each product is stored under its car type so Toyota, Honda, and other makes stay separate.</p>
        </header>

        <div className="car-type-filters" role="tablist" aria-label="Filter by car type">
          <button
            type="button"
            className={`car-type-chip${filterType === 'All' ? ' is-active' : ''}`}
            onClick={() => setFilterType('All')}
          >
            All <em>{typeCounts.All || 0}</em>
          </button>
          {CAR_TYPES.filter((type) => typeCounts[type] > 0).map((type) => (
            <button
              key={type}
              type="button"
              className={`car-type-chip${filterType === type ? ' is-active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type} <em>{typeCounts[type]}</em>
            </button>
          ))}
        </div>

        {partsByCarType.length === 0 && !loading ? (
          <div className="track-empty">
            <h2>No stock yet</h2>
            <p>Receive a product and choose its car type to start the catalog.</p>
          </div>
        ) : null}

        <div className="inventory-type-stack">
          {partsByCarType.map(([carType, list]) => (
            <section className="inventory-type-group" key={carType}>
              <header>
                <h3>{carType}</h3>
                <span>
                  {list.length} product{list.length === 1 ? '' : 's'}
                </span>
              </header>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Car type</th>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>On hand</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((part) => (
                      <tr key={part.id}>
                        <td>
                          <span className="car-type-badge">{part.carType}</span>
                        </td>
                        <td>{part.partName}</td>
                        <td>{part.sku}</td>
                        <td className={part.quantity <= 10 ? 'warn-text' : ''}>{part.quantity}</td>
                        <td>{money(part.retailPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
