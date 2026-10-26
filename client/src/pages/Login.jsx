import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import useAuth from '../hooks/useAuth';

const demos = [
  { label: 'Shop admin', email: 'admin@garagemaster.com', note: 'Operations overview' },
  { label: 'Customer', email: 'customer.alice@gmail.com', note: 'My Garage' },
];

export default function Login() {
  const { login, isAuthenticated, isStaff, isCustomer, booting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (booting) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="auth-muted">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const fallback = isCustomer ? '/garage' : isStaff ? '/dashboard' : '/';
    return <Navigate to={location.state?.from || fallback} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ email, password });
      const intended = location.state?.from;
      if (intended) {
        navigate(intended, { replace: true });
      } else if (user.role === 'CUSTOMER') {
        navigate('/garage', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Unable to sign in. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <aside className="auth-brand">
          <Link to="/" className="auth-brand__logo">
            <span className="site-logo__mark" aria-hidden="true">
              GM
            </span>
            <span>
              <strong>GarageMaster</strong>
              <em>Auto Repair</em>
            </span>
          </Link>
          <h1>Your account, secured.</h1>
          <p>
            Customers manage vehicles in My Garage. Staff run jobs, status updates, and inventory from the shop
            console.
          </p>
          <ul className="auth-points">
            <li>Encrypted sign-in with server verification</li>
            <li>Password recovery if you forget your password</li>
            <li>Role-based access for customers and staff</li>
          </ul>
        </aside>

        <div className="auth-panel">
          <form className="auth-card" onSubmit={handleSubmit} noValidate>
            <p className="auth-kicker">Account access</p>
            <h2>Sign in</h2>
            <p className="auth-lede">Enter the email and password for your GarageMaster account.</p>

            <Input
              label="Email address"
              id="email"
              type="email"
              autoComplete="username"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <div className="auth-password-block">
              <Input
                label="Password"
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="auth-inline-toggle"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="auth-row">
              <Link className="auth-text-link" to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            {error ? (
              <p className="auth-alert" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>

            <p className="auth-footnote">
              Need an account? Ask the shop to add you as a customer, or{' '}
              <Link to="/contact">request a visit</Link>.
            </p>

            <details className="auth-demo">
              <summary>Demo accounts (local testing)</summary>
              <div className="auth-demo__list">
                {demos.map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    className="auth-demo__item"
                    onClick={() => {
                      setEmail(demo.email);
                      setPassword('Password123!');
                      setError('');
                    }}
                  >
                    <strong>{demo.label}</strong>
                    <span>{demo.email}</span>
                    <em>{demo.note}</em>
                  </button>
                ))}
              </div>
              <p className="auth-muted">Demo password: Password123!</p>
            </details>
          </form>
        </div>
      </div>
    </div>
  );
}
