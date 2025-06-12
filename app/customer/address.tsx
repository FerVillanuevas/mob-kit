import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import AnimatedStateView from "~/components/commerce/animated-state-view";
import EmptyHero from "~/components/commerce/empty-hero";
import Icon from "~/components/icon";
import HorizontalItemsSkeleton from "~/components/skeletons/horizontal-items-skeleton";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { getCustomerQueryOptions } from "~/integrations/salesforce/options/customer";

export default function CustomerAddresses() {
  const { data, isLoading, isError } = useQuery(getCustomerQueryOptions());

  const getState = () => {
    if (isLoading) return "loading";
    if (isError) return "error";
    if (!data) return "empty";
    return "success";
  };

  if (isLoading) {
    return <HorizontalItemsSkeleton size={9} />;
  }

  if (!data || !data.addresses || data.addresses.length === 0) {
    return (
      <EmptyHero
        title="No addresses"
        buttonText="Create new address"
        redirectPath="/customer/address/new?mode=new"
      />
    );
  }

  return (
    <View className="flex flex-1">
      <AnimatedStateView
        state={getState()}
        duration={250}
        animationPreset="fade"
        emptyComponent={<EmptyHero />}
        errorComponent={<EmptyHero />}
        loadingComponent={<HorizontalItemsSkeleton size={9} />}
      >
        <>
          <View className="border-b-4 border-border p-4">
            <Text className="text-2xl font-bold">My Addresses</Text>
            <TouchableOpacity
              onPress={() => router.push(`/customer/address/create?mode=new`)}
              className="mt-2 flex flex-row items-center"
            >
              <Icon name="add" size={16} />
              <Text className="ml-1 text-base">Add New Address</Text>
            </TouchableOpacity>
          </View>
          <FlashList
            data={data.addresses}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/customer/address/${item.addressId}`)
                  }
                  className="border-b border-border p-4"
                >
                  <View className="flex flex-row items-center justify-between">
                    <View className="flex flex-col">
                      <Text className="font-semibold">{item.addressId}</Text>
                      <Text className="text-sm text-muted-foreground">
                        {item.firstName} {item.lastName}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {item.address1}, {item.city}, {item.stateCode}{" "}
                        {item.postalCode}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {item.countryCode}
                      </Text>
                    </View>
                    <Icon name="chevron-forward" size={20} />
                  </View>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <Separator />}
          />
        </>
      </AnimatedStateView>
    </View>
  );
}
