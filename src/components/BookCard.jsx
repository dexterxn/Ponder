import { Link } from 'react-router-dom';
import { BOOK_STATUSES } from '../lib/books.js';

const statusLabel = (id) => BOOK_STATUSES.find((s) => s.id === id)?.label || 'Want to read';

export default function BookCard({ book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex flex-col gap-3 rounded-2xl p-2 transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-paper-200 shadow-book ring-1 ring-paper-300/60">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-paper-200 to-paper-300 p-4 text-center">
            <span className="font-serif text-lg leading-tight text-ink-soft">
              {book.title}
            </span>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-paper-50/90 px-2.5 py-0.5 text-[11px] font-medium text-ink-soft shadow-sm">
          {statusLabel(book.status)}
        </span>
      </div>
      <div className="px-1">
        <h3 className="line-clamp-2 font-serif text-base font-semibold leading-snug text-ink">
          {book.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-ink-muted">{book.author}</p>
      </div>
    </Link>
  );
}
