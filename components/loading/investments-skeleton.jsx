import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function InvestmentsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 pb-20 sm:pb-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-lg shadow-black/10">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2">
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-32 flex-shrink-0" />
          ))}
        </div>

        {/* Chart/Content Skeleton */}
        <Card className="shadow-lg shadow-black/10">
          <CardHeader className="p-4 sm:p-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* Investment Items Skeleton */}
        <div className="grid gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-lg shadow-black/10">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

