import { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { getStatusMeta, getTimelineSteps, trackHints, trackVehicle } from '../features/track/trackApi';

function formatWhen(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatMoney(value) {
  if (value == null || value === '') return null;
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Track() {
  const [phone, setPhone] = useState('');
  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [source, setSource] = useState(null);
  const [jobs, setJobs] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSearched(true);
    setLoading(true);

    try {
      if (!phone.trim() && !plate.trim()) {
        setError('Enter a phone number or license plate.');
        setJobs([]);
        return;
      }

      const result = await trackVehicle({ phone, plate });
      setJobs(result.jobs);
      setSource(result.source);
    } catch (err) {
      setJobs([]);
      setError(err.message || 'Unable to look up your vehicle right now.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (nextPhone, nextPlate) => {
    setPhone(nextPhone);
    setPlate(nextPlate);
    setError('');
  };

  return (
    <>
      <section className="page-hero">
        <div className="shop-wrap">
          <p className="shop-eyebrow shop-eyebrow--accent">Track repair</p>
          <h1>See where your vehicle stands</h1>
          <p className="page-hero__lede">
            Look up your repair with the phone number on file or your license plate. You’ll see status, advisor notes, and
            whether the car is ready for pickup.
          </p>
        </div>
      </section>

      <section className="shop-band shop-band--white">
        <div className="shop-wrap track-layout">
          <form className="track-form" onSubmit={handleSubmit}>
            <h2>Find your vehicle</h2>
            <p className="track-form__hint">Use either field — or both for a tighter match.</p>
            <Input
              label="Phone number"
              id="track-phone"
              type="tel"
              placeholder="+256772111111"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <Input
              label="License plate"
              id="track-plate"
              placeholder="UBM 456B"
              value={plate}
              onChange={(event) => setPlate(event.target.value)}
            />
            {error ? <p className="track-error">{error}</p> : null}
            <Button type="submit" disabled={loading}>
              {loading ? 'Looking up…' : 'Check status'}
            </Button>

            <div className="track-demos">
              <p>Try a seeded demo lookup:</p>
              <div className="track-demos__row">
                <button type="button" className="track-chip" onClick={() => fillDemo(trackHints.phones[0], 'UBM 456B')}>
                  Alice · UBM 456B (in progress)
                </button>
                <button type="button" className="track-chip" onClick={() => fillDemo(trackHints.phones[0], 'UBL 123A')}>
                  Alice · UBL 123A (ready)
                </button>
                <button type="button" className="track-chip" onClick={() => fillDemo(trackHints.phones[1], 'UBP 789C')}>
                  Bob · UBP 789C (checked in)
                </button>
              </div>
            </div>
          </form>

          <div className="track-results">
            {!searched ? (
              <div className="track-empty">
                <h2>Your updates appear here</h2>
                <p>After you search, we’ll show each open or recent repair tied to that phone or plate.</p>
              </div>
            ) : null}

            {searched && !loading && jobs.length === 0 && !error ? (
              <div className="track-empty">
                <h2>No repairs found</h2>
                <p>
                  We couldn’t find an active or recent job for that lookup. Double-check the plate/phone, or call{' '}
                  <a href="tel:+15552148800">(555) 214-8800</a>.
                </p>
              </div>
            ) : null}

            {source === 'demo' && jobs.length > 0 ? (
              <p className="track-source">Showing demo shop data (API unavailable or empty). Seeded records still work for walkthroughs.</p>
            ) : null}

            {jobs.map((job) => {
              const meta = getStatusMeta(job.status);
              const steps = getTimelineSteps(job.status);
              const estimate = formatMoney(job.estimatedCost);
              const actual = formatMoney(job.actualCost);

              return (
                <article className="track-card" key={job.id}>
                  <header className="track-card__head">
                    <div>
                      <p className="track-card__plate">{job.vehicle?.licensePlate ?? 'Vehicle'}</p>
                      <h2>
                        {job.vehicle?.year} {job.vehicle?.make} {job.vehicle?.model}
                      </h2>
                      {job.customer ? (
                        <p className="track-card__owner">
                          {job.customer.firstName} {job.customer.lastName}
                        </p>
                      ) : null}
                    </div>
                    <span className={`track-status track-status--${job.status.toLowerCase()}`}>{meta.label}</span>
                  </header>

                  <p className="track-card__desc">{job.description}</p>
                  {job.notes ? <p className="track-card__notes"><strong>Shop note:</strong> {job.notes}</p> : null}

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
                    {estimate ? (
                      <div>
                        <dt>Estimate</dt>
                        <dd>{estimate}</dd>
                      </div>
                    ) : null}
                    {actual ? (
                      <div>
                        <dt>Final</dt>
                        <dd>{actual}</dd>
                      </div>
                    ) : null}
                  </dl>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
