import { Link } from 'react-router-dom';
import { qualities } from '../data/siteContent';

export default function WhyUs() {
  return (
    <>
      <section className="page-hero">
        <div className="shop-wrap">
          <p className="shop-eyebrow shop-eyebrow--accent">Why Us</p>
          <h1>This is what quality auto repair looks like</h1>
          <p className="page-hero__lede">
            See what makes GarageMaster different from the shops that left you second-guessing the bill.
          </p>
        </div>
      </section>

      <section className="shop-band shop-band--panel">
        <div className="shop-wrap">
          <div className="quality-list">
            {qualities.map((item, index) => (
              <article className="quality-row" key={item.title}>
                <span className="quality-row__num">0{index + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shop-cta">
        <div className="shop-wrap shop-cta__inner">
          <div>
            <h2>Experience the difference</h2>
            <p>Book a visit and see how clear communication and honest estimates change the repair experience.</p>
          </div>
          <div className="shop-cta__actions">
            <Link className="button button-primary" to="/contact">
              Schedule an appointment
            </Link>
            <Link className="button button-on-dark" to="/services">
              Browse services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
