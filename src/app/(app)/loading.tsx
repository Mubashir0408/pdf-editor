import { Skeleton } from "@/components/ui/skeleton";

export default function AppGroupLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-40 w-full rounded-3xl sm:h-44" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
