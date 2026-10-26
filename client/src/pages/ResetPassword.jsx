import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { resetPasswordRequest } from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is missing a token. Request a new recovery email.');
      return;
    }

    if (password.length < 8) {
      setError('Use at least 8 characters for your new password.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordRequest({ token, password });
      setDone(true);
      window.setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setError(err.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-layout auth-layout--narrow">
        <div className="auth-panel auth-panel--solo">
          <form className="auth-card" onSubmit={handleSubmit}>
            <Link className="auth-text-link" to="/login">
              ← Back to sign in
            </Link>
            <p className="auth-kicker">Account recovery</p>
            <h2>Set a new password</h2>
            <p className="auth-lede">Choose a strong password you don’t use on other sites.</p>

            {!token ? (
              <p className="auth-alert" role="alert">
                Invalid reset link.{' '}
                <Link to="/forgot-password">Request a new one</Link>.
              </p>
            ) : null}

            {done ? (
              <div className="auth-success" role="status">
                <h3>Password updated</h3>
                <p>You can sign in with your new password. Redirecting…</p>
                <Link className="button button-primary" to="/login">
                  Sign in now
                </Link>
              </div>
            ) : (
              <>
                <div className="auth-password-block">
                  <Input
                    label="New password"
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
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
                <Input
                  label="Confirm new password"
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                />
                {error ? (
                  <p className="auth-alert" role="alert">
                    {error}
                  </p>
                ) : null}
                <Button type="submit" disabled={loading || !token}>
                  {loading ? 'Updating…' : 'Update password'}
                </Button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
