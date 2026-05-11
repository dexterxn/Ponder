import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 7.1 29.5 5 24 5 16.3 5 9.7 9.3 6.3 14.7Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-2.1 13.9-5.4l-6.4-5.4C29.5 34.6 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.4 5.4C41.7 36.6 44 30.9 44 24c0-1.2-.1-2.3-.4-3.5Z"
      />
    </svg>
  );
}

export default function Login() {
  const { user, signInWithGoogle } = useAuth();
  const location = useLocation();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    const dest = location.state?.from?.pathname || '/';
    return <Navigate to={dest} replace />;
  }

  const handleSignIn = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err?.message || 'Could not sign in. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">A reading journal</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">Ponder</h1>
        <p className="mt-3 text-ink-muted">
          Keep your books, page numbers, and quiet thoughts in one warm place.
        </p>

        <button
          type="button"
          onClick={handleSignIn}
          disabled={submitting}
          className="btn-primary mt-8 w-full"
        >
          <GoogleIcon />
          {submitting ? 'Signing in…' : 'Continue with Google'}
        </button>

        {error && <p className="mt-4 text-sm text-accent">{error}</p>}

        <p className="mt-8 text-xs text-ink-muted">
          By continuing you agree to keep your notes to yourself. They&apos;re stored privately
          under your account.
        </p>
      </div>
    </div>
  );
}
