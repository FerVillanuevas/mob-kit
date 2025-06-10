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
import { AuthTypes } from "~/integrations/salesforce/enums";
import {
  getBasketQueryOptions,
  useAddPaymentInstrumentToBasketMutation,
} from "~/integrations/salesforce/options/basket";
import { getCustomerQueryOptions } from "~/integrations/salesforce/options/customer";
import { PaymentFormValues, PaymentSchema } from "~/lib/forms/checkout";

const maskCardNumber = (cardNumber: string) => {
  // Remove all spaces and non-digits
  const cleanNumber = cardNumber.replace(/\D/g, "");

  // If already masked or less than 4 digits, return as is
  if (cardNumber.includes("*") || cleanNumber.length < 4) {
    return cardNumber;
  }

  // Get last 4 digits
  const last4 = cleanNumber.slice(-4);

  // Create masked version with asterisks
  const maskedPortion = "*".repeat(Math.max(0, cleanNumber.length - 4));

  return maskedPortion + last4;
};

const Form = ({
  basket,
  customer,
}: {
  basket: ShopperBasketsTypes.Basket;
  customer?: ShopperCustomersTypes.Customer;
}) => {
  const form = useForm({
    defaultValues: {
      cartType: "Visa",
    },
    resolver: zodResolver(PaymentSchema),
  });

  const addPaymentInstrumentToBasketMutation =
    useAddPaymentInstrumentToBasketMutation();

  const isRegistered = customer?.authType === AuthTypes.REGISTERED;

  const handleBack = async () => {
    router.back();
  };

  const handleSubmit = async (data: PaymentFormValues) => {
    if (!basket?.basketId) return;

    await addPaymentInstrumentToBasketMutation.mutateAsync({
      params: {
        basketId: basket.basketId,
      },
      body: {
        paymentMethodId: "CREDIT_CARD",
        paymentCard: {
          holder: data.holder,
          maskedNumber: maskCardNumber(data.maskedNumber),
          cardType: data.cartType,
          expirationMonth: Number.parseInt(data.expirationMonth),
          expirationYear: Number.parseInt(data.expirationYear),
        },
      },
    });

    router.navigate("/(checkout)/review");
  };

  return (
    <View className="flex flex-1">
      <KeyboardView>
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Payment method</CardDescription>
          </CardHeader>

          <CardContent className="gap-y-4">
            <Controller
              control={form.control}
              name="holder"
              render={({ field }) => (
                <View className="gap-2">
                  <Label>Name</Label>
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
              name="maskedNumber"
              render={({ field }) => (
                <View className="gap-2">
                  <Label>Card Number</Label>
                  <Input
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    value={field.value}
                  />
                </View>
              )}
            />
            <View className="flex flex-row gap-3">
              <Controller
                control={form.control}
                name="expirationMonth"
                render={({ field }) => (
                  <View className="flex-1 gap-2">
                    <Label>Month</Label>
                    <Input
                      keyboardType="number-pad"
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      value={field.value}
                    />
                  </View>
                )}
              />
              <Controller
                control={form.control}
                name="expirationYear"
                render={({ field }) => (
                  <View className="flex-1 gap-2">
                    <Label>Year</Label>
                    <Input
                      keyboardType="number-pad"
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      value={field.value}
                    />
                  </View>
                )}
              />
              <Controller
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <View className="gap-2 min-w-16">
                    <Label>CVV</Label>
                    <Input
                      keyboardType="number-pad"
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      value={field.value}
                    />
                  </View>
                )}
              />
            </View>
          </CardContent>
        </Card>
      </KeyboardView>
      <AvoidingBlur bottom={0} className="flex flex-row gap-4">
        <Button variant="outline" onPress={handleBack}>
          <Text>Back</Text>
        </Button>
        <Button
          disabled={addPaymentInstrumentToBasketMutation.isPending}
          onPress={form.handleSubmit(handleSubmit)}
          className="flex-1"
        >
          <Text>Review Order</Text>
        </Button>
      </AvoidingBlur>
    </View>
  );
};

export default function PaymentPage() {
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
