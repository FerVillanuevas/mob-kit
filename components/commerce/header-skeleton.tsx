import { View } from "react-native"
import { Skeleton } from "~/components/ui/skeleton"

export function HeaderSkeleton() {
  return (
    <View className="p-4 flex-row items-end justify-between">
      <View className="space-y-2">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-5 w-24 rounded-md" />
      </View>
      <Skeleton className="h-10 w-24 rounded-md" />
    </View>
  )
}
