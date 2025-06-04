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
  CardDescription,
  CardFooter,
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
          <Small className="text-muted-foreground text-sm">
            Youre signed in as {customer?.firstName} {customer?.lastName}
          </Small>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          disabled={deleteBasketMutation.isPending}
          onPress={handleDestroy}
        >
          <Text> Back to Cart</Text>
        </Button>
        <Button
          disabled={updateCustomerForBasketMutation.isPending}
          onPress={form.handleSubmit(handleCustomerInfo)}
        >
          <Text>
            {isRegistered ? "Continue to Shipping" : "Continue as Guest"}
          </Text>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function CheckoutPage() {
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
