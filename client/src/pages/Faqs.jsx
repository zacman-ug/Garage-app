import { Link } from 'react-router-dom';
import { faqs } from '../data/siteContent';

export default function Faqs() {
  return (
    <>
      <section className="page-hero">
        <div className="shop-wrap">
          <p className="shop-eyebrow shop-eyebrow--accent">FAQs</p>
          <h1>Frequently asked questions</h1>
          <p className="page-hero__lede">
            Location, hours, appointments, warranties, and how to get on the schedule — answered clearly.
          </p>
        </div>
      </section>

      <section className="shop-band shop-band--white">
        <div className="shop-wrap shop-faq">
          <div className="faq-list">
            {faqs.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="shop-cta">
        <div className="shop-wrap shop-cta__inner">
          <div>
            <h2>Still have a question?</h2>
            <p>Reach out — a service advisor will help you get sorted before you ever pull into the bay.</p>
          </div>
          <div className="shop-cta__actions">
            <Link className="button button-primary" to="/contact">
              Contact us
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
