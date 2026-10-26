import { Link } from 'react-router-dom';
import { services } from '../data/siteContent';
import liftStrip from '../assets/car-service-lift.png';

export default function Services() {
  return (
    <>
      <section className="page-hero">
        <div className="shop-wrap">
          <p className="shop-eyebrow shop-eyebrow--accent">Services</p>
          <h1>Auto repair done right</h1>
          <p className="page-hero__lede">
            Each service covers what we inspect, how we explain findings, and what typically gets included — so you know
            exactly what you’re booking before you call.
          </p>
        </div>
      </section>

      <section className="cut-band cut-band--page" aria-hidden="true">
        <img src={liftStrip} alt="" className="cut-band__img" />
        <div className="cut-band__veil cut-band__veil--soft" />
        <div className="cut-band__edge cut-band__edge--top cut-band__edge--navy" />
        <div className="cut-band__edge cut-band__edge--bottom cut-band__edge--light" />
      </section>

      <section className="shop-band shop-band--white">
        <div className="shop-wrap">
          <div className="service-rail">
            {services.map((service) => (
              <article key={service.name} className="service-item" id={service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
                <h3>{service.name}</h3>
                <p className="service-item__summary">{service.summary}</p>
                <p className="service-item__detail">{service.detail}</p>
                <h4 className="service-item__includes-label">What’s included</h4>
                <ul className="service-item__includes">
                  {service.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link
                  className="service-item__cta"
                  to={`/contact?service=${encodeURIComponent(service.name)}`}
                >
                  Get in touch →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shop-cta">
        <div className="shop-wrap shop-cta__inner">
          <div>
            <h2>Not sure which service you need?</h2>
            <p>Describe the symptom on our contact form — we’ll help you book the right visit.</p>
          </div>
          <div className="shop-cta__actions">
            <Link className="button button-primary" to="/contact">
              Schedule an appointment
            </Link>
            <a className="button button-on-dark" href="tel:+15552148800">
              Call (555) 214-8800
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
