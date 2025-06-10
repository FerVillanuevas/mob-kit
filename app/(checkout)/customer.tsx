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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { Small } from "~/components/ui/typography";
import { AuthTypes } from "~/integrations/salesforce/enums";
import {
  getBasketQueryOptions,
  useDeleteBasketMutation,
  useUpdateCustomerForBasketMutation,
} from "~/integrations/salesforce/options/basket";
import { getCustomerQueryOptions } from "~/integrations/salesforce/options/customer";

const Form = ({
  basket,
  customer,
}: {
  basket: ShopperBasketsTypes.Basket;
  customer?: ShopperCustomersTypes.Customer;
}) => {
  const form = useForm({
    defaultValues: {
      email: customer?.email,
    },
  });
  const deleteBasketMutation = useDeleteBasketMutation();
  const updateCustomerForBasketMutation = useUpdateCustomerForBasketMutation();

  const isRegistered = customer?.authType === AuthTypes.REGISTERED;

  const handleDestroy = async () => {
    if (!basket?.basketId) return;
    await deleteBasketMutation.mutateAsync({
      basketId: basket.basketId,
    });
  };

  const handleCustomerInfo = async (data: any) => {
    if (!basket?.basketId || !data.email) return;

    await updateCustomerForBasketMutation.mutateAsync({
      email: data.email,
      basketId: basket.basketId,
    });

    router.navigate("/(checkout)/address");
  };

  return (
    <View className="flex flex-1">
      <KeyboardView>
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              {isRegistered
                ? "Welcome back! Continue with your email address."
                : "Please provide your email to continue checkout."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Controller
              control={form.control}
              name="email"
              render={({ field }) => (
                <View className="gap-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="Email address"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    value={field.value}
                  />
                </View>
              )}
            />
            {isRegistered && (
              <Small className="text-sm text-muted-foreground">
                Youre signed in as {customer?.firstName} {customer?.lastName}
              </Small>
            )}
          </CardContent>
        </Card>
      </KeyboardView>
      <AvoidingBlur bottom={0} className="flex flex-row gap-4">
        <Button
          variant="outline"
          disabled={deleteBasketMutation.isPending}
          onPress={handleDestroy}
        >
          <Text>Back to Cart</Text>
        </Button>
        <Button
          className="flex-1"
          disabled={updateCustomerForBasketMutation.isPending}
          onPress={form.handleSubmit(handleCustomerInfo)}
        >
          <Text>
            {isRegistered ? "Continue to Address" : "Continue as Guest"}
          </Text>
        </Button>
      </AvoidingBlur>
    </View>
  );
};

export default function CheckoutPage() {
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
