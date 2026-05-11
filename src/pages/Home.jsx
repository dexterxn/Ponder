import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { BOOK_STATUSES, subscribeToBooks } from '../lib/books.js';
import BookCard from '../components/BookCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

const FILTERS = [{ id: 'all', label: 'All' }, ...BOOK_STATUSES];

export default function Home() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return undefined;
    setLoading(true);
    const unsub = subscribeToBooks(user.uid, (rows) => {
      setBooks(rows);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter((b) => {
      if (filter !== 'all' && b.status !== filter) return false;
      if (!q) return true;
      return (
        b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)
      );
    });
  }, [books, search, filter]);

  if (loading) return <LoadingScreen label="Pulling your shelf…" />;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Your library</p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight">
          Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.
        </h1>
        <p className="text-ink-muted">
          {books.length === 0
            ? "Add the first book you're reading to get started."
            : `${books.length} ${books.length === 1 ? 'book' : 'books'} on your shelf.`}
        </p>
      </section>

      {books.length > 0 && (
        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              placeholder="Search by title or author…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input sm:max-w-xs"
            />
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`chip ${filter === f.id ? 'chip-active' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {books.length === 0 ? (
        <EmptyShelf />
      ) : visible.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">
          No books match those filters.
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </section>
      )}
    </div>
  );
}

function EmptyShelf() {
  return (
    <div className="card flex flex-col items-center justify-center gap-4 p-12 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-paper-200 text-paper-700">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5A2.5 2.5 0 0 1 17.5 21H6.5A2.5 2.5 0 0 1 4 18.5v-13Z" />
          <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
        </svg>
      </div>
      <div>
        <h2 className="font-serif text-2xl font-semibold">Your shelf is empty</h2>
        <p className="mt-1 text-ink-muted">
          Add a book to start collecting passages and thoughts.
        </p>
      </div>
      <Link to="/add" className="btn-primary">
        + Add your first book
      </Link>
    </div>
  );
}
