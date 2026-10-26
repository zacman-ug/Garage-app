import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';

const blank = {
  name: '',
  phone: '',
  email: '',
  vehicle: '',
  preferredDate: '',
  message: '',
};

function messageForService(service) {
  if (!service) return '';
  return `Interested in: ${service}\n\nPlease help me schedule this service. Here’s what I’m noticing with the vehicle:\n`;
}

export default function Contact() {
  const [searchParams] = useSearchParams();
  const service = searchParams.get('service')?.trim() || '';
  const [form, setForm] = useState(() => ({
    ...blank,
    message: messageForService(service),
  }));
  const [submitted, setSubmitted] = useState(false);
  const messageRef = useRef(null);
  const formPanelRef = useRef(null);

  useEffect(() => {
    const nextMessage = messageForService(service);
    setSubmitted(false);
    setForm((current) => ({
      ...current,
      message: nextMessage || (current.message.startsWith('Interested in:') ? '' : current.message),
    }));

    if (!service) return;

    const timer = window.setTimeout(() => {
      formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      messageRef.current?.focus({ preventScroll: true });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [service]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setForm({ ...blank, message: messageForService(service) });
  };

  return (
    <>
      <section className="page-hero">
        <div className="shop-wrap">
          <p className="shop-eyebrow shop-eyebrow--accent">Contact</p>
          <h1>Schedule an appointment</h1>
          <p className="page-hero__lede">
            Tell us what’s going on with your vehicle. We’ll follow up to confirm a time — usually within one business hour
            during shop hours.
          </p>
          {service ? (
            <p className="page-hero__service">
              Selected service: <strong>{service}</strong>
            </p>
          ) : null}
        </div>
      </section>

      <section className="shop-band shop-band--white">
        <div className="shop-wrap contact-grid">
          <aside className="contact-aside">
            <h2>GarageMaster Auto Repair</h2>
            <dl className="contact-facts">
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href="tel:+15552148800">(555) 214-8800</a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href="mailto:service@garagemaster.com">service@garagemaster.com</a>
                </dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>
                  420 Industrial Avenue
                  <br />
                  Riverside, IL 60546
                </dd>
              </div>
              <div>
                <dt>Hours</dt>
                <dd>
                  Mon–Fri 7:00am – 6:00pm
                  <br />
                  Sat 8:00am – 2:00pm
                  <br />
                  Sun Closed
                </dd>
              </div>
            </dl>
            <a
              className="text-link"
              href="https://maps.google.com/?q=420+Industrial+Avenue+Riverside+IL"
              target="_blank"
              rel="noreferrer"
            >
              Get directions →
            </a>
            <div className="contact-map" aria-hidden="true">
              <span>Riverside · Bay lot</span>
            </div>
          </aside>

          <div className="contact-form-panel" id="schedule" ref={formPanelRef}>
            {submitted ? (
              <div className="contact-success" role="status">
                <h2>Request received</h2>
                <p>
                  Thanks — a service advisor will reach out shortly to confirm your appointment. Need something faster? Call{' '}
                  <a href="tel:+15552148800">(555) 214-8800</a>.
                </p>
                <Button type="button" variant="ghost" onClick={() => setSubmitted(false)}>
                  Send another request
                </Button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <h2>Request a time</h2>
                <p className="contact-form__hint">Appointments are recommended for same-day service.</p>
                <div className="contact-form__row">
                  <Input label="Full name" id="name" required value={form.name} onChange={update('name')} />
                  <Input label="Phone" id="phone" type="tel" required value={form.phone} onChange={update('phone')} />
                </div>
                <Input
                  label="Email"
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={update('email')}
                />
                <Input
                  label="Vehicle (year, make, model)"
                  id="vehicle"
                  required
                  placeholder="e.g. 2018 Toyota RAV4"
                  value={form.vehicle}
                  onChange={update('vehicle')}
                />
                <Input
                  label="Preferred date"
                  id="preferredDate"
                  type="date"
                  value={form.preferredDate}
                  onChange={update('preferredDate')}
                />
                <label className="input-field" htmlFor="message">
                  <span>What can we help with?</span>
                  <textarea
                    id="message"
                    ref={messageRef}
                    rows={5}
                    required
                    placeholder="Describe the issue, warning lights, or service you need…"
                    value={form.message}
                    onChange={update('message')}
                  />
                </label>
                <Button type="submit">Submit appointment request</Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
