import { useQuery } from "@tanstack/react-query";
import currency from "currency.js";
import { Redirect, router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import KeyboardView from "~/components/keyboard-view";
import Loading from "~/components/loading";
import { H4, P } from "~/components/ui/typography";
import {
  getBasketQueryOptions,
  getShippingMethodsForShipmentQueryOptions,
  useUpdateShippingMethodForShipmentMutation,
} from "~/integrations/salesforce/options/basket";
import { cn } from "~/lib/utils";

export default function ShippingPage() {
  const { data: basket, isLoading: isBasketLoading } = useQuery(
    getBasketQueryOptions()
  );

  const { data: shippingMethods, isLoading: loadingMethods } = useQuery(
    getShippingMethodsForShipmentQueryOptions({ basketId: basket?.basketId! })
  );

  const updateShippingMethodForShipmentMutation =
    useUpdateShippingMethodForShipmentMutation();

  const handleSubmit = async (methodId: string) => {
    if (!basket?.basketId) return;

    await updateShippingMethodForShipmentMutation.mutateAsync({
      params: {
        basketId: basket.basketId,
        shipmentId: "me",
      },
      body: {
        id: methodId,
      },
    });

    router.navigate("/(checkout)/payment");
  };

  if (loadingMethods || isBasketLoading) {
    return <Loading />;
  }

  if (!basket?.basketId) {
    return <Redirect href="/" />;
  }

  return (
    <KeyboardView>
      <View className="p-4 gap-4">
        {shippingMethods?.applicableShippingMethods?.map((method) => {
          return (
            <TouchableOpacity
              key={method.id}
              onPress={() => handleSubmit(method.id)}
              className={cn(
                "border border-border rounded-md p-4",
                shippingMethods.defaultShippingMethodId === method.id &&
                  "border-primary"
              )}
            >
              <H4>{method.name}</H4>
              <P>{currency(method.price || 0).format()}</P>
            </TouchableOpacity>
          );
        })}
      </View>
    </KeyboardView>
  );
}
