import { useEffect, useState } from 'react';
import { getStatusMeta, JOB_STATUSES } from '../features/track/trackApi';
import { fetchAdminJobs, updateJobStatus } from '../services/api';

const columns = ['PENDING', 'DIAGNOSING', 'PARTS_ON_ORDER', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function Repairs() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminJobs();
      const list = data.jobs ?? [];
      setJobs(list);
      setDrafts(
        Object.fromEntries(
          list.map((job) => [
            job.id,
            { status: job.status, notes: job.notes ?? '' },
          ])
        )
      );
    } catch (err) {
      setError(err.message || 'Unable to load repairs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const updateDraft = (jobId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [jobId]: {
        ...current[jobId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (jobId) => {
    const draft = drafts[jobId];
    if (!draft) return;

    setSavingId(jobId);
    setError('');
    setSuccess('');

    try {
      const { job } = await updateJobStatus(jobId, {
        status: draft.status,
        notes: draft.notes,
      });

      setJobs((current) => current.map((item) => (item.id === jobId ? job : item)));
      setDrafts((current) => ({
        ...current,
        [jobId]: { status: job.status, notes: job.notes ?? '' },
      }));
      setSuccess(
        `Updated ${job.vehicle?.licensePlate || 'job'} → ${getStatusMeta(job.status).label}`
      );
    } catch (err) {
      setError(err.message || 'Unable to update job status.');
    } finally {
      setSavingId(null);
    }
  };

  const byStatus = columns.map((status) => ({
    status,
    label: getStatusMeta(status).label,
    items: jobs.filter((job) => job.status === status),
  }));

  return (
    <div className="ops-page">
      <div className="page-intro">
        <span className="page-kicker">Staff · Repair workflow</span>
        <h2>Diagnose → wrench → deliver</h2>
        <p>Update each car’s status so customers see it instantly in Track and My Garage.</p>
      </div>

      {loading ? <p className="page-kicker">Loading jobs…</p> : null}
      {error ? <p className="track-error">{error}</p> : null}
      {success ? <p className="track-success">{success}</p> : null}

      <div className="board">
        {byStatus.map((column) => (
          <article className="board-col" key={column.status}>
            <header>
              <h3>{column.label}</h3>
              <span className="count">{String(column.items.length).padStart(2, '0')}</span>
            </header>
            {column.items.length === 0 ? <p>No jobs in this lane.</p> : null}
            {column.items.map((job) => {
              const draft = drafts[job.id] ?? { status: job.status, notes: job.notes ?? '' };
              const dirty =
                draft.status !== job.status || (draft.notes ?? '') !== (job.notes ?? '');

              return (
                <div className="ticket ticket--editable" key={job.id}>
                  <strong>
                    {job.vehicle?.licensePlate || 'RO'} · {job.vehicle?.make} {job.vehicle?.model}
                  </strong>
                  <span>{job.description}</span>

                  <label className="ticket-field">
                    <span>Status</span>
                    <select
                      value={draft.status}
                      onChange={(event) => updateDraft(job.id, 'status', event.target.value)}
                      disabled={savingId === job.id}
                    >
                      {JOB_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {getStatusMeta(status).label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="ticket-field">
                    <span>Shop note</span>
                    <textarea
                      rows={2}
                      value={draft.notes}
                      placeholder="Visible to the customer…"
                      onChange={(event) => updateDraft(job.id, 'notes', event.target.value)}
                      disabled={savingId === job.id}
                    />
                  </label>

                  <button
                    type="button"
                    className="button button-primary button-compact"
                    disabled={savingId === job.id || !dirty}
                    onClick={() => handleSave(job.id)}
                  >
                    {savingId === job.id ? 'Saving…' : 'Update status'}
                  </button>
                </div>
              );
            })}
          </article>
        ))}
      </div>
    </div>
  );
}
