import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md p-10 text-center">
      <h1 className="font-serif text-3xl font-semibold">Lost the page</h1>
      <p className="mt-2 text-ink-muted">That page doesn&apos;t exist in your library.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        Back to library
      </Link>
    </div>
  );
}
