import { Spinner } from "./ui/spinner";

export function LoadingIndicator() {
  // const isLoading = useRouterState({ select: (s) => s.isLoading });
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <Spinner className="animate-spin text-ring size-6" />
    </div>
  );
}
