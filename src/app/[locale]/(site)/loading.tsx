export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="skeleton h-56 w-full rounded-2xl mb-10" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton h-7 w-48 mb-6 rounded-lg" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="skeleton aspect-[4/3] w-full rounded-none" />
            <div className="p-5 space-y-3">
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-6 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
