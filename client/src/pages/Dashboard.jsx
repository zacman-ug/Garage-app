import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStatusMeta } from '../features/track/trackApi';
import useAuth from '../hooks/useAuth';
import { fetchAdminOverview } from '../services/api';

function formatWhen(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function Dashboard() {
  const { displayName, isAdmin } = useAuth();
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAdminOverview();
        if (!cancelled) setOverview(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load overview.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="ops-page">
      <div className="page-intro">
        <span className="page-kicker">{isAdmin ? 'Admin · Shop overview' : 'Staff · Shop overview'}</span>
        <h2>Operations board</h2>
        <p>
          Signed in as {displayName}. Live counts from the database — jobs, inventory pressure, customers, and recent
          floor activity.
        </p>
      </div>

      {loading ? <p className="page-kicker">Loading overview…</p> : null}
      {error ? <p className="track-error">{error}</p> : null}

      {overview ? (
        <>
          <div className="metrics garage-metrics" role="list">
            <div className="metric" role="listitem">
              <span className="metric-value">{String(overview.metrics.openJobs).padStart(2, '0')}</span>
              <div>
                <h3>Open jobs</h3>
                <p>Active on the floor</p>
              </div>
            </div>
            <div className="metric" role="listitem">
              <span className="metric-value warn">{String(overview.metrics.partsLow).padStart(2, '0')}</span>
              <div>
                <h3>Parts low</h3>
                <p>SKU qty ≤ 10</p>
              </div>
            </div>
            <div className="metric" role="listitem">
              <span className="metric-value ok">{String(overview.metrics.completedJobs).padStart(2, '0')}</span>
              <div>
                <h3>Completed</h3>
                <p>Finished repair orders</p>
              </div>
            </div>
            <div className="metric" role="listitem">
              <span className="metric-value">{String(overview.metrics.customers).padStart(2, '0')}</span>
              <div>
                <h3>Customers</h3>
                <p>Accounts on file</p>
              </div>
            </div>
            <div className="metric" role="listitem">
              <span className="metric-value">{String(overview.metrics.vehicles).padStart(2, '0')}</span>
              <div>
                <h3>Vehicles</h3>
                <p>Registered profiles</p>
              </div>
            </div>
            <div className="metric" role="listitem">
              <span className="metric-value">{String(overview.metrics.mechanics).padStart(2, '0')}</span>
              <div>
                <h3>Technicians</h3>
                <p>Mechanics available</p>
              </div>
            </div>
          </div>

          <div className="split" style={{ marginTop: 28 }}>
            <section>
              <header className="section-head">
                <h2>Recent repair activity</h2>
                <p>
                  Full board also on <Link to="/repairs">Repairs</Link>.
                </p>
              </header>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Vehicle</th>
                      <th>Customer</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.recentJobs.map((job) => (
                      <tr key={job.id}>
                        <td>{getStatusMeta(job.status).label}</td>
                        <td>
                          {job.vehicle
                            ? `${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model} · ${job.vehicle.licensePlate}`
                            : '—'}
                        </td>
                        <td>
                          {job.customer
                            ? `${job.customer.firstName} ${job.customer.lastName}`
                            : '—'}
                        </td>
                        <td>{formatWhen(job.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid" style={{ gap: 20 }}>
              <div className="panel panel-accent">
                <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
                  Status mix
                </h3>
                <ul className="status-breakdown">
                  {overview.statusBreakdown.map((row) => (
                    <li key={row.status}>
                      <span>{getStatusMeta(row.status).label}</span>
                      <strong>{row.count}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="panel">
                <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
                  Inventory watch
                </h3>
                <ul className="status-breakdown">
                  {overview.inventory.map((part) => (
                    <li key={part.id}>
                      <span>
                        {part.partName}
                        <small style={{ display: 'block', color: 'var(--muted)' }}>
                          {part.carType} · {part.sku}
                        </small>
                      </span>
                      <strong className={part.quantity <= 10 ? 'warn-text' : ''}>{part.quantity}</strong>
                    </li>
                  ))}
                </ul>
                <Link className="button button-primary button-compact" to="/inventory" style={{ marginTop: 16 }}>
                  Manage inventory
                </Link>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
