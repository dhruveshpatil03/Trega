export function ListingGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array(8).fill(0).map((_, i) => (<div key={i} className="card-elevated h-64 animate-pulse" />))}
    </div>
  );
}
