import { Link } from 'react-router-dom';
import { frustrations, promises, services } from '../data/siteContent';
import heroBay from '../assets/car-bay-hero.png';
import detailStrip from '../assets/car-detail-strip.png';
import liftStrip from '../assets/car-service-lift.png';

export default function Home() {
  return (
    <>
      <section className="shop-hero">
        <div
          className="shop-hero__media"
          style={{ backgroundImage: `url(${heroBay})` }}
          aria-hidden="true"
        />
        <div className="shop-hero__veil" aria-hidden="true" />
        <div className="shop-hero__content">
          <p className="shop-eyebrow">We take the frustration out of auto repair</p>
          <h1 className="shop-hero__brand">
            Garage<em>Master</em>
          </h1>
          <p className="shop-hero__tagline">
            Auto repair you can trust — clear answers, honest estimates, keys back when we promised.
          </p>
          <div className="shop-hero__actions">
            <Link className="button button-primary" to="/contact">
              Schedule an appointment
            </Link>
            <a className="button button-on-dark" href="tel:+15552148800">
              Call (555) 214-8800
            </a>
          </div>
        </div>
      </section>

      <section className="shop-band shop-band--white">
        <div className="shop-wrap shop-intro">
          <h2>We’re in the people business — and people drive cars.</h2>
          <p>
            Finding a shop you can trust shouldn’t feel impossible. GarageMaster focuses on integrity and customer
            education so you leave informed, not talked down to.
          </p>
          <div className="home-links">
            <Link className="text-link" to="/why-us">
              Why choose us →
            </Link>
            <Link className="text-link" to="/garage">
              My Garage →
            </Link>
            <Link className="text-link" to="/contact">
              Schedule an appointment →
            </Link>
          </div>
        </div>
      </section>

      <section className="cut-band cut-band--detail" aria-hidden="true">
        <img src={detailStrip} alt="" className="cut-band__img" />
        <div className="cut-band__veil" />
        <div className="cut-band__edge cut-band__edge--top" />
        <div className="cut-band__edge cut-band__edge--bottom" />
      </section>

      <section className="shop-band shop-band--ink">
        <div className="shop-wrap">
          <h2 className="shop-heading shop-heading--light">Have you been frustrated by shops that:</h2>
          <ul className="frustration-list">
            {frustrations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="shop-belief">We believe your auto repair experience can be better.</p>
          <div className="promise-grid">
            {promises.map((item) => (
              <article key={item.title} className="promise-item">
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
          <div className="band-footer-link">
            <Link className="text-link text-link--on-dark" to="/why-us">
              Read what sets us apart →
            </Link>
          </div>
        </div>
      </section>

      <section className="shop-band shop-band--panel">
        <div className="shop-wrap">
          <header className="section-head">
            <h2>Services at a glance</h2>
            <p>Explore full details, what’s included, and book the service you need.</p>
          </header>
          <div className="home-service-grid">
            {services.slice(0, 3).map((service) => (
              <Link key={service.name} className="home-service-card" to="/services">
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
                <span>See details →</span>
              </Link>
            ))}
          </div>
          <div className="band-footer-link">
            <Link className="button button-primary" to="/services">
              View all services
            </Link>
          </div>
        </div>
      </section>

      <section className="cut-band cut-band--lift" aria-hidden="true">
        <img src={liftStrip} alt="" className="cut-band__img" />
        <div className="cut-band__veil cut-band__veil--soft" />
        <div className="cut-band__edge cut-band__edge--top cut-band__edge--panel" />
        <div className="cut-band__edge cut-band__edge--bottom cut-band__edge--dark" />
      </section>

      <section className="shop-cta">
        <div className="shop-wrap shop-cta__inner">
          <div>
            <h2>Ready when you are</h2>
            <p>Call (555) 214-8800 or send a request — we’ll confirm your appointment and get you moving again.</p>
          </div>
          <div className="shop-cta__actions">
            <Link className="button button-primary" to="/contact">
              Schedule your appointment
            </Link>
            <Link className="button button-on-dark" to="/track">
              Track your vehicle
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
