export default function LoadingScreen({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-ink-muted">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-paper-500" />
        <span className="font-serif text-lg">{label}</span>
      </div>
    </div>
  );
}
