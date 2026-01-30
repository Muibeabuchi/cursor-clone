import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";
import { getPadding } from "./constants";

export function LoadingRow({
  level = 0,
  className,
}: {
  level?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center text-muted-foreground h-5.5",
        // getPadding(level),
        className,
      )}
      style={{ paddingLeft: getPadding({ level, isFile: true }) }}
    >
      <Spinner className="size-4 text-ring ml-0.5" />
    </div>
  );
}
