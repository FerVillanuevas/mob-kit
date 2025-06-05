import { View } from "react-native";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

export function ProductSkeleton({ className }: { className?: string }) {
  return (
    <View className={cn("w-full", className)}>
      {/* Image skeleton */}
      <Skeleton className="aspect-[8/11] w-full rounded-md" />

      {/* Content skeleton */}
      <View className="mt-3 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <View className="flex-row justify-between">
          <Skeleton className="h-4 w-1/3 rounded-md" />
          <Skeleton className="h-4 w-1/4 rounded-md" />
        </View>
      </View>
    </View>
  )
}

export function ProductGridSkeleton({
  numColumns = 2,
  numItems = 6,
  className,
}: { numColumns?: number; numItems?: number; className?: string }) {
  return (
    <View className={cn("flex-row flex-wrap", className)}>
      {Array.from({ length: numItems }).map((_, i) => (
        <View key={i} className={cn("p-4", numColumns === 2 ? "w-1/2" : "w-full")}>
          <ProductSkeleton />
        </View>
      ))}
    </View>
  )
}
