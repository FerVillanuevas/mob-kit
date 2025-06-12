import { View } from "react-native";
import { Skeleton } from "~/components/ui/skeleton";

export default function HorizontalItemsSkeleton({size = 8}: {size?: number}) {
  return (
    <View className="flex flex-1">
      <Skeleton className="h-6 w-3/4" pulse />
      <View className="gap-y-4">
        {Array.from({ length: size }).map((_, index) => (
          <View key={index}>
            <View className="p-4">
              <Skeleton className="h-6 w-3/4" pulse />
              <Skeleton className="h-4 w-1/2" pulse />
              <Skeleton className="h-4 w-1/3" pulse />
            </View>
            <Skeleton className="h-1 w-full" pulse />
          </View>
        ))}
      </View>
    </View>
  );
}
