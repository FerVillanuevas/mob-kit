import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  ShopperBasketsTypes,
  ShopperCustomersTypes,
} from "commerce-sdk-isomorphic";
import { Redirect, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import AvoidingBlur from "~/components/avoiding-blur";
import KeyboardView from "~/components/keyboard-view";
import Loading from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { AuthTypes } from "~/integrations/salesforce/enums";
import {
  getBasketQueryOptions,
  useUpdateShippingAddressForShipmentMutation,
} from "~/integrations/salesforce/options/basket";
import { getCustomerQueryOptions } from "~/integrations/salesforce/options/customer";
import {
  ShippingAddresFormValues,
  ShippingAddressSchema,
} from "~/lib/forms/checkout";

const Form = ({
  basket,
  customer,
}: {
  basket: ShopperBasketsTypes.Basket;
  customer?: ShopperCustomersTypes.Customer;
}) => {
  const form = useForm({
    defaultValues: {
      firstName: customer?.firstName,
      lastName: customer?.lastName,
      countryCode: "US",
    },
    resolver: zodResolver(ShippingAddressSchema),
  });
  const updateShippingAddressForShipmentMutation =
    useUpdateShippingAddressForShipmentMutation();
  const isRegistered = customer?.authType === AuthTypes.REGISTERED;

  const handleBack = async () => {
    router.back();
  };

  const handleSubmit = async (data: ShippingAddresFormValues) => {
    if (!basket?.basketId) return;

    await updateShippingAddressForShipmentMutation.mutateAsync({
      params: {
        basketId: basket.basketId,
        shipmentId: "me",
        useAsBilling: true,
      },
      body: data,
    });

    router.navigate("/(checkout)/shipping");
  };

  return (
    <View className="flex flex-1">
      <KeyboardView>
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>

          <CardContent className="gap-y-4">
            <Controller
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <View className="gap-2">
                  <Label>First Name</Label>
                  <Input
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    value={field.value}
                  />
                </View>
              )}
            />

            <Controller
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <View className="gap-2">
                  <Label>Last Name</Label>
                  <Input
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    value={field.value}
                  />
                </View>
              )}
            />

            <Controller
              control={form.control}
              name="phone"
              render={({ field }) => (
                <View className="gap-2">
                  <Label>Phone Number</Label>
                  <Input
                    inputMode="tel"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    value={field.value}
                  />
                </View>
              )}
            />

            <Controller
              control={form.control}
              name="address1"
              render={({ field }) => (
                <View className="gap-2">
                  <Label>Address</Label>
                  <Input
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    value={field.value}
                  />
                </View>
              )}
            />

            <Controller
              control={form.control}
              name="city"
              render={({ field }) => (
                <View className="gap-2">
                  <Label>City</Label>
                  <Input
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    value={field.value}
                  />
                </View>
              )}
            />

            <Controller
              control={form.control}
              name="stateCode"
              render={({ field }) => (
                <View className="gap-2">
                  <Label>State</Label>
                  <Input
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    value={field.value}
                  />
                </View>
              )}
            />

            <Controller
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <View className="gap-2">
                  <Label>Postal Code</Label>
                  <Input
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    value={field.value}
                  />
                </View>
              )}
            />
          </CardContent>
        </Card>
      </KeyboardView>

      <AvoidingBlur bottom={0} className="flex flex-row gap-4">
        <Button variant="outline" onPress={handleBack}>
          <Text>Back</Text>
        </Button>
        <Button
          disabled={updateShippingAddressForShipmentMutation.isPending}
          onPress={form.handleSubmit(handleSubmit)}
          className="flex-1"
        >
          <Text>
            Continue to shipping
          </Text>
        </Button>
      </AvoidingBlur>
    </View>
  );
};

export default function AddressPage() {
  const { data: customer, isLoading } = useQuery(getCustomerQueryOptions());
  const { data: basket, isLoading: isBasketLoading } = useQuery(
    getBasketQueryOptions(),
  );

  if (isLoading || isBasketLoading) {
    return <Loading />;
  }

  if (!basket?.basketId) {
    return <Redirect href="/" />;
  }

  return <Form customer={customer} basket={basket} />;
}
