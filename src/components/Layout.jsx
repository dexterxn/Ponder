import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function BookmarkIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Layout() {
  const { user, signOut: doSignOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await doSignOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 border-b border-paper-200/80 bg-paper-100/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-ink">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-paper-50">
              <BookmarkIcon className="h-4 w-4" />
            </span>
            <span className="font-serif text-xl font-semibold tracking-tight">Ponder</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${isActive ? 'btn-outline' : 'btn-ghost'} text-sm`
              }
            >
              Library
            </NavLink>
            <NavLink to="/add" className="btn-primary text-sm">
              + Add book
            </NavLink>
            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="btn-ghost text-sm"
                title={user.email || 'Sign out'}
              >
                Sign out
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-center text-xs text-ink-muted sm:px-6">
        Ponder · A quiet place for what you read.
      </footer>
    </div>
  );
}
