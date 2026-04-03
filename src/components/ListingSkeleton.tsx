import { Skeleton } from "@/components/ui/skeleton";

export const ListingSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-2xl bg-card border border-border animate-pulse">
      <Skeleton className="aspect-square w-full rounded-xl bg-muted" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4 bg-muted" />
        <Skeleton className="h-3 w-1/2 bg-muted opacity-50" />
      </div>
      <div className="flex items-center justify-between mt-1">
        <Skeleton className="h-5 w-16 bg-muted" />
        <Skeleton className="h-7 w-20 rounded-lg bg-primary/20" />
      </div>
    </div>
  );
};

export const ListingGridSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <ListingSkeleton key={i} />
      ))}
    </div>
  );
};

export default ListingSkeleton;
