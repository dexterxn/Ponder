import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { BOOK_STATUSES, createBook, updateBook } from '../lib/books.js';
import { uploadCover } from '../lib/storage.js';

export default function AddBook() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState('reading');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (f) => {
    if (!f) {
      setFile(null);
      setPreview('');
      return;
    }
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError('');
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !author.trim()) {
      setError('Title and author are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const bookId = await createBook(user.uid, {
        title,
        author,
        status,
      });
      if (file) {
        const { url } = await uploadCover(user.uid, bookId, file);
        await updateBook(user.uid, bookId, { coverUrl: url });
      }
      navigate(`/books/${bookId}`, { replace: true });
    } catch (err) {
      setError(err?.message || 'Something went wrong saving the book.');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link to="/" className="text-sm text-ink-muted hover:text-ink">
          ← Back to library
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Add a book</h1>
        <p className="text-ink-muted">A few details and you&apos;re ready to start jotting.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6 p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-[auto,1fr]">
          <div className="flex flex-col items-center gap-3">
            <div className="aspect-[2/3] w-32 overflow-hidden rounded-xl bg-paper-200 shadow-book ring-1 ring-paper-300/60 sm:w-36">
              {preview ? (
                <img src={preview} alt="Cover preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-3 text-center font-serif text-sm text-ink-muted">
                  Cover preview
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-outline text-sm"
              >
                {file ? 'Change cover' : 'Choose / take photo'}
              </button>
              {file && (
                <button
                  type="button"
                  onClick={() => handleFile(null)}
                  className="btn-ghost text-xs"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-ink-soft">
                Title
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Brothers Karamazov"
                className="input"
                autoFocus
                required
              />
            </div>

            <div>
              <label htmlFor="author" className="mb-1 block text-sm font-medium text-ink-soft">
                Author
              </label>
              <input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Fyodor Dostoevsky"
                className="input"
                required
              />
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-ink-soft">Status</span>
              <div className="flex flex-wrap gap-2">
                {BOOK_STATUSES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id)}
                    className={`chip ${status === s.id ? 'chip-active' : ''}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-accent">{error}</p>}

        <div className="flex justify-end gap-2">
          <Link to="/" className="btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save book'}
          </button>
        </div>
      </form>
    </div>
  );
}
