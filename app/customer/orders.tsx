import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import EmptyHero from "~/components/commerce/empty-hero";
import { Pagination } from "~/components/commerce/pagination";
import Icon from "~/components/icon";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { getCustomerOrdersQueryOptions } from "~/integrations/salesforce/options/customer";
import { REQUESTED_LIMIT } from "~/lib/constants";

export default function CustomerOrders() {
  const { offset } = useLocalSearchParams<{ offset?: string }>();

  const { data, isLoading } = useQuery(
    getCustomerOrdersQueryOptions({
      offset: Number(offset) || 0,
      limit: REQUESTED_LIMIT,
    }),
  );

  const handleNavigate = (updateFn: (prev: any) => any) => {
    const newParams = updateFn({ offset: Number(offset) || 0 });
    router.setParams({ offset: newParams.offset.toString() });
  };

  if (isLoading) {
    return (
      <View className="flex flex-1 p-4">
        <Text className="mb-4 text-2xl font-bold">My Orders</Text>
        <View className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} className="border-b border-border p-4">
              <Skeleton className="mb-2 h-6 w-3/4" pulse />
              <Skeleton className="mb-2 h-4 w-1/2" pulse />
              <Skeleton className="h-4 w-1/3" pulse />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!data) {
    return <EmptyHero title="No orders" hideButton />;
  }

  return (
    <View className="flex flex-1">
      <View className="border-b-4 border-border p-4">
        <Text className="text-2xl font-bold">My Orders</Text>
      </View>
      <FlashList
        data={data?.data}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => router.push(`/customer/orders/${item.orderNo}`)}
              className="border-b border-border p-4"
            >
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-col">
                  <Text className="font-semibold">Order #{item.orderNo}</Text>
                  <Text className="text-sm text-muted-foreground">
                    Date:{" "}
                    {item.creationDate
                      ? new Date(item.creationDate).toLocaleDateString()
                      : "N/A"}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Status: {item.status || "N/A"}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Total: {item.orderTotal ? `$${item.orderTotal.toFixed(2)}` : "N/A"}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="flex flex-1 items-center justify-center p-8">
            <Text className="text-lg text-muted-foreground">
              No orders found
            </Text>
          </View>
        }
        ListFooterComponent={
          <Pagination
            navigate={handleNavigate}
            offset={data?.offset || 0}
            requestedLimit={REQUESTED_LIMIT}
            total={data?.total || 0}
            isLoading={isLoading}
          />
        }
        ItemSeparatorComponent={() => <Separator />}
      />
    </View>
  );
}
