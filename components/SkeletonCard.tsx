export function SkeletonCard() {
  return (
    <div className="card animate-pulse border border-base-300/50 bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        <div className="flex justify-between gap-2">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-3/4 rounded-lg bg-base-300" />
            <div className="h-4 w-1/2 rounded-lg bg-base-300" />
          </div>
          <div className="h-8 w-14 rounded-full bg-base-300" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-base-300" />
          <div className="h-3 w-2/3 rounded bg-base-300" />
        </div>
        <div className="grid grid-cols-3 gap-3 rounded-lg bg-base-200 p-3">
          <div className="h-10 rounded bg-base-300" />
          <div className="h-10 rounded bg-base-300" />
          <div className="h-10 rounded bg-base-300" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="animate-pulse rounded-2xl border border-base-300/50 bg-base-100 p-6 shadow-sm">
      <div className="mb-3 h-3 w-24 rounded bg-base-300" />
      <div className="h-8 w-20 rounded bg-base-300" />
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStat key={i} />
      ))}
    </div>
  );
}
