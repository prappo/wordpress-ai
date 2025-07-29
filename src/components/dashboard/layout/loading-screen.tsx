import { Skeleton } from "@/components/ui/skeleton";

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function DashboardLoadingScreen() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="grid flex-1 items-start gap-6 p-0 md:grid-cols-1 lg:grid-cols-2">
        <div className="grid auto-rows-max items-start gap-6">
          <div className="grid gap-6">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
