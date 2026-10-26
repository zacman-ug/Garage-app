import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStatusMeta, getTimelineSteps } from '../features/track/trackApi';
import useAuth from '../hooks/useAuth';
import { fetchGarage } from '../services/api';

function formatWhen(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function JobBlock({ job }) {
  const meta = getStatusMeta(job.status);
  const steps = getTimelineSteps(job.status);

  return (
    <article className="track-card">
      <header className="track-card__head">
        <div>
          <p className="track-card__plate">{job.vehicle?.licensePlate}</p>
          <h2>
            {job.vehicle?.year} {job.vehicle?.make} {job.vehicle?.model}
          </h2>
        </div>
        <span className={`track-status track-status--${job.status.toLowerCase()}`}>{meta.label}</span>
      </header>
      <p className="track-card__desc">{job.description}</p>
      {job.notes ? (
        <p className="track-card__notes">
          <strong>Shop note:</strong> {job.notes}
        </p>
      ) : null}
      {job.mechanic ? (
        <p className="track-card__notes">
          Assigned tech: {job.mechanic.firstName} {job.mechanic.lastName}
        </p>
      ) : null}
      <ol className="track-timeline">
        {steps.map((step) => (
          <li key={step.key} className={`track-timeline__step is-${step.state}`}>
            <span className="track-timeline__dot" aria-hidden="true" />
            <div>
              <strong>{step.label}</strong>
              <p>{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <dl className="track-meta">
        <div>
          <dt>Last update</dt>
          <dd>{formatWhen(job.updatedAt)}</dd>
        </div>
        <div>
          <dt>Opened</dt>
          <dd>{formatWhen(job.createdAt)}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function Garage() {
  const { displayName, user } = useAuth();
  const [garage, setGarage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchGarage();
        if (!cancelled) setGarage(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load your garage.');
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
    <>
      <section className="page-hero">
        <div className="shop-wrap">
          <p className="shop-eyebrow shop-eyebrow--accent">My Garage</p>
          <h1>Welcome, {user?.firstName || displayName}</h1>
          <p className="page-hero__lede">
            Your vehicles, active repairs, and service history — secured with your account.
          </p>
        </div>
      </section>

      <section className="shop-band shop-band--white">
        <div className="shop-wrap">
          {loading ? <p className="page-kicker">Loading your garage…</p> : null}
          {error ? <p className="track-error">{error}</p> : null}

          {garage ? (
            <>
              <div className="metrics garage-metrics" role="list">
                <div className="metric" role="listitem">
                  <span className="metric-value">{String(garage.summary.vehicleCount).padStart(2, '0')}</span>
                  <div>
                    <h3>Vehicles</h3>
                    <p>On your account</p>
                  </div>
                </div>
                <div className="metric" role="listitem">
                  <span className="metric-value">{String(garage.summary.activeCount).padStart(2, '0')}</span>
                  <div>
                    <h3>Active jobs</h3>
                    <p>Currently in the shop</p>
                  </div>
                </div>
                <div className="metric" role="listitem">
                  <span className="metric-value ok">{String(garage.summary.completedCount).padStart(2, '0')}</span>
                  <div>
                    <h3>Completed</h3>
                    <p>Past repairs on file</p>
                  </div>
                </div>
              </div>

              <div className="garage-section">
                <header className="section-head">
                  <h2>Your vehicles</h2>
                  <p>Profiles tied to this customer account.</p>
                </header>
                <div className="home-service-grid">
                  {garage.vehicles.map((vehicle) => (
                    <article className="home-service-card" key={vehicle.id}>
                      <h3>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p>Plate: {vehicle.licensePlate || '—'}</p>
                      <p>VIN: {vehicle.vin || '—'}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="garage-section">
                <header className="section-head">
                  <h2>Active repairs</h2>
                  <p>Live status for work currently on the floor.</p>
                </header>
                {garage.activeJobs.length === 0 ? (
                  <div className="track-empty">
                    <h2>No active repairs</h2>
                    <p>
                      Nothing in the bays right now.{' '}
                      <Link className="text-link" to="/contact">
                        Schedule a visit →
                      </Link>
                    </p>
                  </div>
                ) : (
                  <div className="track-results">
                    {garage.activeJobs.map((job) => (
                      <JobBlock key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </div>

              <div className="garage-section">
                <header className="section-head">
                  <h2>Service history</h2>
                  <p>Completed and closed repair orders.</p>
                </header>
                {garage.history.length === 0 ? (
                  <div className="track-empty">
                    <h2>No history yet</h2>
                    <p>Finished jobs will land here after pickup.</p>
                  </div>
                ) : (
                  <div className="track-results">
                    {garage.history.map((job) => (
                      <JobBlock key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
