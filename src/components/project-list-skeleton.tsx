import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";

const ProjectItemSkeleton = () => {
  return (
    <div className="flex items-center justify-between w-full py-1">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-sm" /> {/* Icon */}
        <Skeleton className="h-4 w-24" /> {/* Project Name */}
      </div>
      <Skeleton className="h-3 w-16" /> {/* Timestamp */}
    </div>
  );
};

export const ProjectListSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* Last Updated Section */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-20" /> {/* "Last Updated" text */}
        <Button
          variant="outline"
          className="h-auto items-start justify-start p-4 bg-background border rounded-none flex flex-col gap-2 w-full"
          disabled
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-sm" /> {/* Icon */}
              <Skeleton className="h-4 w-32" /> {/* Project Name */}
            </div>
            <Skeleton className="size-4" /> {/* Arrow Icon */}
          </div>
          <Skeleton className="h-3 w-24" /> {/* Timestamp */}
        </Button>
      </div>

      {/* Recent Projects Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-24" /> {/* "Recent Projects" text */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12" /> {/* "View All" text */}
            <Skeleton className="h-5 w-16" /> {/* Kbd badge */}
          </div>
        </div>

        <ul className="flex flex-col gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <ProjectItemSkeleton key={i} />
          ))}
        </ul>
      </div>
    </div>
  );
};
