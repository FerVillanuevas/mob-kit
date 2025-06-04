import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ShopperBasketsTypes, ShopperCustomersTypes } from "commerce-sdk-clean";
import { Redirect, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import KeyboardView from "~/components/keyboard-view";
import Loading from "~/components/loading";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>Address Information</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
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

      <CardFooter className="flex justify-between">
        <Button variant="outline" onPress={handleBack}>
          <Text> Back to Cart</Text>
        </Button>
        <Button
          disabled={updateShippingAddressForShipmentMutation.isPending}
          onPress={form.handleSubmit(handleSubmit)}
        >
          <Text>
            {isRegistered ? "Continue to Shipping" : "Continue as Guest"}
          </Text>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function AddressPage() {
  const { data: customer, isLoading } = useQuery(getCustomerQueryOptions());
  const { data: basket, isLoading: isBasketLoading } = useQuery(
    getBasketQueryOptions()
  );

  if (isLoading || isBasketLoading) {
    return <Loading />;
  }

  if (!basket?.basketId) {
    return <Redirect href="/" />;
  }

  return (
    <KeyboardView>
      <View className="p-4">
        <Form customer={customer} basket={basket} />
      </View>
    </KeyboardView>
  );
}
