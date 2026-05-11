import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  BOOK_STATUSES,
  deleteBook,
  getBook,
  updateBook,
} from '../lib/books.js';
import {
  createNote,
  deleteNote,
  subscribeToNotes,
  updateNote,
} from '../lib/notes.js';
import { deleteCoverByUrl, uploadCover, validateCoverFile } from '../lib/storage.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const statusLabel = (id) => BOOK_STATUSES.find((s) => s.id === id)?.label || 'Want to read';

function formatDate(ts) {
  if (!ts?.toDate) return '';
  const d = ts.toDate();
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BookDetail() {
  const { bookId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingBook, setEditingBook] = useState(false);
  const [confirmDeleteBook, setConfirmDeleteBook] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  useEffect(() => {
    if (!user || !bookId) return undefined;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const b = await getBook(user.uid, bookId);
        if (cancelled) return;
        if (!b) {
          setError('Book not found.');
        } else {
          setBook(b);
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Could not load book.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    const unsub = subscribeToNotes(user.uid, bookId, setNotes);
    return () => {
      cancelled = true;
      unsub();
    };
  }, [user, bookId]);

  const handleStatusChange = async (newStatus) => {
    if (!user || !book) return;
    setBook({ ...book, status: newStatus });
    try {
      await updateBook(user.uid, book.id, { status: newStatus });
    } catch (err) {
      setError(err?.message || 'Could not update status.');
    }
  };

  const handleSaveBookEdits = async (patch, newCoverFile) => {
    if (!user || !book) return;
    let coverUrl = book.coverUrl;
    if (newCoverFile) {
      const { url } = await uploadCover(user.uid, book.id, newCoverFile);
      if (book.coverUrl && book.coverUrl !== url) {
        await deleteCoverByUrl(book.coverUrl);
      }
      coverUrl = url;
    }
    const fullPatch = { ...patch, coverUrl };
    await updateBook(user.uid, book.id, fullPatch);
    setBook({ ...book, ...fullPatch });
    setEditingBook(false);
  };

  const handleDeleteBook = async () => {
    if (!user || !book) return;
    if (book.coverUrl) await deleteCoverByUrl(book.coverUrl);
    await deleteBook(user.uid, book.id);
    navigate('/', { replace: true });
  };

  const handleAddNote = async ({ content, page }) => {
    if (!user || !book) return;
    await createNote(user.uid, book.id, { content, page });
  };

  const handleEditNote = async (noteId, patch) => {
    if (!user || !book) return;
    await updateNote(user.uid, book.id, noteId, patch);
  };

  const handleDeleteNote = async (noteId) => {
    if (!user || !book) return;
    await deleteNote(user.uid, book.id, noteId);
    setDeletingNoteId(null);
  };

  if (loading) return <LoadingScreen label="Opening the book…" />;
  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-accent">{error}</p>
        <Link to="/" className="btn-ghost mt-4 inline-flex">
          Back to library
        </Link>
      </div>
    );
  }
  if (!book) return null;

  return (
    <div className="space-y-10">
      <div>
        <Link to="/" className="text-sm text-ink-muted hover:text-ink">
          ← Back to library
        </Link>
      </div>

      <section className="grid gap-8 sm:grid-cols-[auto,1fr] sm:gap-10">
        <div className="mx-auto w-44 sm:mx-0 sm:w-48">
          <div className="aspect-[2/3] overflow-hidden rounded-xl bg-paper-200 shadow-book ring-1 ring-paper-300/60">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-4 text-center font-serif text-lg text-ink-soft">
                {book.title}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">
              {statusLabel(book.status)}
            </p>
            <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              {book.title}
            </h1>
            <p className="mt-1 text-ink-muted">by {book.author}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {BOOK_STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStatusChange(s.id)}
                className={`chip ${book.status === s.id ? 'chip-active' : ''}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingBook(true)}
              className="btn-outline text-sm"
            >
              Edit details
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteBook(true)}
              className="btn-ghost text-sm text-accent hover:bg-accent/10"
            >
              Delete book
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold">Notes</h2>
          <span className="text-sm text-ink-muted">
            {notes.length} {notes.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <NoteComposer onAdd={handleAddNote} />

        {notes.length === 0 ? (
          <div className="card p-8 text-center text-ink-muted">
            No notes yet. Capture your first thought or quote above.
          </div>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onSave={(patch) => handleEditNote(note.id, patch)}
                onRequestDelete={() => setDeletingNoteId(note.id)}
              />
            ))}
          </ul>
        )}
      </section>

      {editingBook && (
        <EditBookDialog
          book={book}
          onCancel={() => setEditingBook(false)}
          onSave={handleSaveBookEdits}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteBook}
        title="Delete this book?"
        description="This will remove the book and all of its notes. This cannot be undone."
        confirmLabel="Delete book"
        destructive
        onCancel={() => setConfirmDeleteBook(false)}
        onConfirm={handleDeleteBook}
      />
      <ConfirmDialog
        open={!!deletingNoteId}
        title="Delete this note?"
        description="The note will be removed from this book."
        confirmLabel="Delete note"
        destructive
        onCancel={() => setDeletingNoteId(null)}
        onConfirm={() => handleDeleteNote(deletingNoteId)}
      />
    </div>
  );
}

function NoteComposer({ onAdd }) {
  const [content, setContent] = useState('');
  const [page, setPage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Write something first.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const pageNum = page === '' ? null : Number(page);
      await onAdd({ content, page: pageNum });
      setContent('');
      setPage('');
    } catch (err) {
      setError(err?.message || 'Could not save note.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-3 p-4 sm:p-5">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="A passage, a thought, a question…"
        rows={3}
        className="input resize-y"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Page
          <input
            type="number"
            min="1"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="—"
            className="input w-24 py-1.5"
          />
        </label>
        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-accent">{error}</span>}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Add note'}
          </button>
        </div>
      </div>
    </form>
  );
}

function NoteItem({ note, onSave, onRequestDelete }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(note.content || '');
  const [page, setPage] = useState(note.page ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const pageNum = page === '' || page === null ? null : Number(page);
      await onSave({ content, page: pageNum });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <li className="card space-y-3 p-4 sm:p-5">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="input resize-y"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            Page
            <input
              type="number"
              min="1"
              value={page ?? ''}
              onChange={(e) => setPage(e.target.value)}
              className="input w-24 py-1.5"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setEditing(false);
                setContent(note.content || '');
                setPage(note.page ?? '');
              }}
            >
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="card group p-4 sm:p-5">
      <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-ink">
        {note.content}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
        <div className="flex items-center gap-3">
          {note.page != null && <span>p. {note.page}</span>}
          {formatDate(note.createdAt) && <span>{formatDate(note.createdAt)}</span>}
        </div>
        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            className="btn-ghost px-3 py-1 text-xs"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn-ghost px-3 py-1 text-xs text-accent hover:bg-accent/10"
            onClick={onRequestDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

function EditBookDialog({ book, onCancel, onSave }) {
  const fileRef = useRef(null);
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(book.coverUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (f) => {
    if (!f) return;
    const fileError = validateCoverFile(f);
    if (fileError) {
      setError(fileError);
      return;
    }
    setError('');
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError('Title and author are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ title, author }, file);
    } catch (err) {
      setError(err?.message || 'Could not save changes.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onCancel} />
      <form
        onSubmit={submit}
        className="card relative w-full max-w-lg space-y-5 p-6 sm:p-7"
      >
        <div>
          <h3 className="font-serif text-2xl font-semibold">Edit book</h3>
          <p className="text-sm text-ink-muted">Update details or swap the cover.</p>
        </div>

        <div className="grid grid-cols-[auto,1fr] gap-5">
          <div className="flex flex-col items-center gap-2">
            <div className="aspect-[2/3] w-24 overflow-hidden rounded-lg bg-paper-200 ring-1 ring-paper-300/60">
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-2 text-center font-serif text-xs text-ink-muted">
                  No cover
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.heic,.heif"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              className="btn-outline text-xs"
              onClick={() => fileRef.current?.click()}
            >
              Change cover
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-soft">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-soft">Author</label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-accent">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
