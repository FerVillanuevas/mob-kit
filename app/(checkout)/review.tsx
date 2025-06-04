import { useQuery } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { ScrollView, View } from "react-native";
import Loading from "~/components/loading";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { H3 } from "~/components/ui/typography";
import { getBasketQueryOptions } from "~/integrations/salesforce/options/basket";
import { getCustomerQueryOptions } from "~/integrations/salesforce/options/customer";
import { useCreateOrderMutation } from "~/integrations/salesforce/options/orders";

export  default function ReviewPage() {
  const { data: customer, isLoading } = useQuery(getCustomerQueryOptions());
  const { data: basket, isLoading: isBasketLoading } = useQuery(
    getBasketQueryOptions()
  );

  const createOrderMutation = useCreateOrderMutation();

  const handleSubmit = async () => {
    if (!basket?.basketId) return;

    await createOrderMutation.mutateAsync({
      body: { basketId: basket.basketId },
    });
  };

  if (isLoading || isBasketLoading) {
    return <Loading />;
  }

  if (!basket?.basketId) {
    return <Redirect href="/" />;
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="space-y-6 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Review Your Order</CardTitle>
            <CardDescription>
              Please review your information before placing your order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Information */}
            <View>
              <H3 className="mb-2 font-semibold">Contact Information</H3>
              <View className="space-y-1">
                <Text className="text-muted-foreground text-sm">
                  {customer?.firstName} {customer?.lastName}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {customer?.email}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {customer?.phone}
                </Text>
              </View>
            </View>

            <Separator />

            {/* Shipping Address */}
            <View>
              <H3 className="mb-2 font-semibold">Shipping Address</H3>
              <View className="space-y-1">
                {basket?.shipments?.[0]?.shippingAddress && (
                  <>
                    <Text className="text-muted-foreground text-sm">
                      {basket.shipments[0].shippingAddress.firstName}{" "}
                      {basket.shipments[0].shippingAddress.lastName}
                    </Text>
                    <Text className="text-muted-foreground text-sm">
                      {basket.shipments[0].shippingAddress.address1}
                    </Text>
                    {basket.shipments[0].shippingAddress.address2 && (
                      <Text className="text-muted-foreground text-sm">
                        {basket.shipments[0].shippingAddress.address2}
                      </Text>
                    )}
                    <Text className="text-muted-foreground text-sm">
                      {basket.shipments[0].shippingAddress.city},{" "}
                      {basket.shipments[0].shippingAddress.stateCode}{" "}
                      {basket.shipments[0].shippingAddress.postalCode}
                    </Text>
                  </>
                )}
              </View>
            </View>

            <Separator />

            {/* Shipping Method */}
            <View>
              <H3 className="mb-2 font-semibold">Shipping Method</H3>
              <View>
                {basket?.shipments?.[0]?.shippingMethod && (
                  <View className="flex-row justify-between">
                    <Text className="text-muted-foreground text-sm">
                      {basket.shipments[0].shippingMethod.name}
                    </Text>
                    <Text className="text-muted-foreground text-sm">
                      {basket.shipments[0].shippingMethod.price}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Separator />

            {/* Payment Method */}
            <View>
              <H3 className="mb-2 font-semibold">Payment Method</H3>
              <View>
                {basket?.paymentInstruments?.[0] && (
                  <>
                    <Text className="text-muted-foreground text-sm">
                      Card ending in{" "}
                      {basket.paymentInstruments[0].paymentCard?.maskedNumber?.slice(
                        -4
                      )}
                    </Text>
                    <Text className="text-muted-foreground text-sm">
                      Expires{" "}
                      {
                        basket.paymentInstruments[0].paymentCard
                          ?.expirationMonth
                      }
                      /
                      {basket.paymentInstruments[0].paymentCard?.expirationYear}
                    </Text>
                  </>
                )}
              </View>
            </View>

            <Separator />

            {/* Order Items */}
            <View>
              <H3 className="mb-2 font-semibold">Order Items</H3>
              <View className="space-y-3">
                {basket?.productItems?.map((item: any) => (
                  <View key={item.itemId} className="flex-row justify-between">
                    <View className="flex-1">
                      <Text className="font-medium text-sm">
                        {item.productName}
                      </Text>
                      <Text className="text-muted-foreground text-sm">
                        Quantity: {item.quantity}
                      </Text>
                    </View>
                    <Text className="font-medium text-sm">{item.price}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Order Summary */}
            {basket && (
              <>
                <Separator />
                <View>
                  <H3 className="mb-2 font-semibold">Order Summary</H3>
                  <View className="space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-muted-foreground text-sm">
                        Subtotal
                      </Text>
                      <Text className="text-sm">
                        {basket.productSubTotal || basket.orderTotal}
                      </Text>
                    </View>
                    {basket.shippingTotal && (
                      <View className="flex-row justify-between">
                        <Text className="text-muted-foreground text-sm">
                          Shipping
                        </Text>
                        <Text className="text-sm">{basket.shippingTotal}</Text>
                      </View>
                    )}
                    {basket.taxTotal && (
                      <View className="flex-row justify-between">
                        <Text className="text-muted-foreground text-sm">
                          Tax
                        </Text>
                        <Text className="text-sm">{basket.taxTotal}</Text>
                      </View>
                    )}
                    <Separator />
                    <View className="flex-row justify-between">
                      <Text className="font-semibold">Total</Text>
                      <Text className="font-semibold text-lg">
                        {basket.orderTotal}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <View className="flex-row justify-between gap-4 pb-8">
          <Button
            variant="outline"
            onPress={() => {
              router.back();
            }}
            className="flex-1"
          >
            <Text>Back to Payment</Text>
          </Button>
          <Button onPress={handleSubmit} size="lg" className="flex-1">
            <Text>Place Order</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
