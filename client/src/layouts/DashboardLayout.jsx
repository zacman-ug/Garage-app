import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const phoneDisplay = '(555) 214-8800';
const phoneHref = 'tel:+15552148800';

export default function DashboardLayout() {
  const { user, isAuthenticated, isStaff, isCustomer, displayName, logout, booting } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site">
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="site-logo" to="/" onClick={closeMenu}>
            <span className="site-logo__mark" aria-hidden="true">
              GM
            </span>
            <span className="site-logo__text">
              <strong>GarageMaster</strong>
              <span>Auto Repair</span>
            </span>
          </Link>

          <button
            type="button"
            className={`nav-toggle${menuOpen ? ' is-open' : ''}`}
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Menu</span>
            <span />
            <span />
            <span />
          </button>

          <nav id="primary-nav" className={`site-nav${menuOpen ? ' is-open' : ''}`} aria-label="Primary">
            <NavLink to="/" end onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink to="/services" onClick={closeMenu}>
              Services
            </NavLink>
            <NavLink to="/why-us" onClick={closeMenu}>
              Why Us
            </NavLink>
            <NavLink to="/faqs" onClick={closeMenu}>
              FAQs
            </NavLink>
            <NavLink to="/track" onClick={closeMenu}>
              Track
            </NavLink>
            <NavLink to="/contact" onClick={closeMenu}>
              Contact
            </NavLink>
            {!booting && isCustomer ? (
              <NavLink to="/garage" onClick={closeMenu}>
                My Garage
              </NavLink>
            ) : null}
            {!booting && isStaff ? (
              <>
                <NavLink to="/dashboard" onClick={closeMenu}>
                  Dashboard
                </NavLink>
                <NavLink to="/repairs" onClick={closeMenu}>
                  Repairs
                </NavLink>
                <NavLink to="/inventory" onClick={closeMenu}>
                  Inventory
                </NavLink>
              </>
            ) : null}
            {!booting && isAuthenticated ? (
              <button
                type="button"
                className="nav-text-btn"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                Logout {user?.firstName || displayName}
              </button>
            ) : (
              <NavLink to="/login" onClick={closeMenu}>
                Sign in
              </NavLink>
            )}
            <a className="site-nav__phone" href={phoneHref}>
              {phoneDisplay}
            </a>
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand">
            <strong>GarageMaster Auto Repair</strong>
            <p>Clear estimates, ASE-certified work, and a repair experience you can trust.</p>
            <nav className="site-footer__nav" aria-label="Footer">
              <Link to="/services">Services</Link>
              <Link to="/why-us">Why Us</Link>
              <Link to="/faqs">FAQs</Link>
              <Link to="/track">Track repair</Link>
              <Link to="/garage">My Garage</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>
          <div>
            <h3>Visit</h3>
            <p>
              420 Industrial Avenue
              <br />
              Riverside, IL 60546
            </p>
            <a href="https://maps.google.com/?q=420+Industrial+Avenue+Riverside+IL" target="_blank" rel="noreferrer">
              Get directions →
            </a>
          </div>
          <div>
            <h3>Hours</h3>
            <p>
              Mon–Fri · 7:00am – 6:00pm
              <br />
              Sat · 8:00am – 2:00pm
              <br />
              Sun · Closed
            </p>
          </div>
          <div>
            <h3>Contact</h3>
            <p>
              <a href={phoneHref}>{phoneDisplay}</a>
              <br />
              <a href="mailto:service@garagemaster.com">service@garagemaster.com</a>
            </p>
            <Link className="button button-primary button-compact" to="/contact">
              Schedule appointment
            </Link>
          </div>
        </div>
        <div className="site-footer__bar">
          <span>© {new Date().getFullYear()} GarageMaster Auto Repair</span>
          <Link to="/login">Customer & staff sign in</Link>
        </div>
      </footer>
    </div>
  );
}
