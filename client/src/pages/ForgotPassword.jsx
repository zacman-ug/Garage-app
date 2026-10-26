import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { forgotPasswordRequest } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const data = await forgotPasswordRequest({ email });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Unable to start password recovery.');
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
            <h2>Forgot your password?</h2>
            <p className="auth-lede">
              Enter the email on your account. We’ll send a secure link so you can choose a new password.
            </p>

            {!result ? (
              <>
                <Input
                  label="Email address"
                  id="recovery-email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {error ? (
                  <p className="auth-alert" role="alert">
                    {error}
                  </p>
                ) : null}
                <Button type="submit" disabled={loading}>
                  {loading ? 'Sending…' : 'Send recovery link'}
                </Button>
              </>
            ) : (
              <div className="auth-success" role="status">
                <h3>Check your inbox</h3>
                <p>{result.message}</p>
                {result.resetUrl ? (
                  <div className="auth-recovery-box">
                    <p>{result.hint}</p>
                    <a className="button button-primary" href={result.resetUrl}>
                      Continue to reset password
                    </a>
                    <p className="auth-muted auth-break">{result.resetUrl}</p>
                  </div>
                ) : (
                  <p className="auth-muted">Didn’t get an email? Check spam, or contact the shop for help.</p>
                )}
                <Link className="auth-text-link" to="/login">
                  Return to sign in
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
