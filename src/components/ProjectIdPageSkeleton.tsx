import { SideBarSkeleton } from "~/components/SideBarSkeleton";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

export const ProjectIdPageSkeleton = () => {
  return (
    <div className="flex h-full flex-col">
      {/* Navbar Skeleton */}
      <nav className="h-[35px] flex items-center border-b bg-sidebar px-2">
        <div className="flex items-center h-full gap-2 px-3 border-r">
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex items-center h-full gap-2 px-3 border-r">
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="flex-1 flex justify-end h-full">
          <div className="flex items-center h-full gap-1.5 px-3 border-l">
            <Skeleton className="h-3.5 w-3.5 mr-1" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </nav>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Skeleton (File Explorer) */}
        <div className="w-[457px] border-r flex flex-col bg-sidebar">
          <SideBarSkeleton />
        </div>

        {/* Editor Skeleton */}
        <div className="flex-1 bg-background p-4 space-y-2">
          <Skeleton className="h-4 w-[40%]" />
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-4 w-[50%]" />
          <Skeleton className="h-4 w-[70%]" />
          <Skeleton className="h-4 w-[30%]" />
          <Skeleton className="h-4 w-[55%]" />
          <div className="pt-4 space-y-2">
            <Skeleton className="h-4 w-[45%]" />
            <Skeleton className="h-4 w-[35%]" />
            <Skeleton className="h-4 w-[65%]" />
          </div>
        </div>
      </div>
    </div>
  );
};
