import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import EmptyHero from "~/components/commerce/empty-hero";
import Icon from "~/components/icon";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { getCustomerQueryOptions } from "~/integrations/salesforce/options/customer";

export default function CustomerPayments() {
  const { data, isLoading } = useQuery(getCustomerQueryOptions());

  if (isLoading) {
    return (
      <View className="flex flex-1 p-4">
        <Text className="mb-4 text-2xl font-bold">My Payment Methods</Text>
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

  if (
    !data ||
    !data.paymentInstruments ||
    data.paymentInstruments.length === 0
  ) {
    return (
      <EmptyHero
        title="No payment methods"
        redirectPath="/customer/payments/create?mode=new"
        buttonText="Add New Payment Method"
      />
    );
  }

  return (
    <View className="flex flex-1">
      <View className="border-b-4 border-border p-4">
        <Text className="text-2xl font-bold">My Payment Methods</Text>
        <TouchableOpacity
          onPress={() => router.push("/customer/payments/create?mode=new")}
          className="mt-2 flex flex-row items-center"
        >
          <Icon name="add" size={16} />
          <Text className="ml-1 text-base">Add New Payment Method</Text>
        </TouchableOpacity>
      </View>
      <FlashList
        data={data.paymentInstruments}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() =>
                router.push(`/customer/payments/${item.paymentInstrumentId}`)
              }
              className="border-b border-border p-4"
            >
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-col">
                  <Text className="font-semibold">{item.paymentMethodId}</Text>
                  {item.paymentCard && (
                    <>
                      <Text className="text-sm text-muted-foreground">
                        {item.paymentCard.cardType} ending in{" "}
                        {item.paymentCard.numberLastDigits}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        Expires {item.paymentCard.expirationMonth}/
                        {item.paymentCard.expirationYear}
                      </Text>
                    </>
                  )}
                  {item.paymentBankAccount && (
                    <Text className="text-sm text-muted-foreground">
                      Bank Account ending in{" "}
                      {item.paymentBankAccount.numberLastDigits}
                    </Text>
                  )}
                </View>
                <Icon name="chevron-forward" size={20} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="flex flex-1 items-center justify-center p-8">
            <Text className="text-lg text-muted-foreground">
              No payment methods found
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <Separator />}
      />
    </View>
  );
}
