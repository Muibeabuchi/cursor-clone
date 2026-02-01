import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

export const SideBarSkeleton = () => {
  return (
    <div className="flex h-full flex-col bg-sidebar border-r w-full">
      {/* Top Section - Project Info */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
        </div>

        {/* Description / Streaming Text Effect */}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[95%]" />
        </div>

        {/* Next Steps Section */}
        <div className="pt-6 space-y-3">
          <Skeleton className="h-5 w-1/2" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[85%]" />
          </div>

          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[90%]" />
          </div>

          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[75%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>

      {/* Bottom Section - Chat Input */}
      <div className="p-4 border-t mt-auto">
        <div className="relative">
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="absolute bottom-2 right-2">
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};
