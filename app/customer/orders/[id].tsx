import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import EmptyHero from "~/components/commerce/empty-hero";
import Icon from "~/components/icon";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { getOrderQueryOptions } from "~/integrations/salesforce/options/orders";

export default function OrderPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading } = useQuery(getOrderQueryOptions(id));

  if (isLoading) {
    return (
      <View className="flex flex-1 p-4">
        <View className="mb-4 flex flex-row items-center">
          <Icon name="chevron-back" size={24} onPress={() => router.back()} />
          <Skeleton className="ml-2 h-6 w-1/2" pulse />
        </View>
        <Separator className="mb-4" />
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">Date:</Text>
              <Skeleton className="h-5 w-1/3" pulse />
            </View>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">Status:</Text>
              <Skeleton className="h-5 w-1/3" pulse />
            </View>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">Total:</Text>
              <Skeleton className="h-5 w-1/3" pulse />
            </View>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <View key={index} className="flex flex-row justify-between">
                  <Skeleton className="h-5 w-1/2" pulse />
                  <Skeleton className="h-5 w-1/3" pulse />
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-5 w-1/2" pulse />
            <Skeleton className="mb-2 h-5 w-3/4" pulse />
            <Skeleton className="mb-2 h-5 w-1/2" pulse />
            <Skeleton className="h-5 w-1/3" pulse />
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-5 w-1/2" pulse />
            <Skeleton className="h-5 w-1/3" pulse />
          </CardContent>
        </Card>
      </View>
    );
  }

  if (!order) {
    return <EmptyHero title="something went wrong" />;
  }

  return (
    <ScrollView>
      <View className="gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">Order Number:</Text>
              <Text>{order.orderNo || "N/A"}</Text>
            </View>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">Date:</Text>
              <Text>
                {order.creationDate
                  ? new Date(order.creationDate).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">Status:</Text>
              <Text>{order.status || "N/A"}</Text>
            </View>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">
                Confirmation Status:
              </Text>
              <Text>{order.confirmationStatus || "N/A"}</Text>
            </View>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">Payment Status:</Text>
              <Text>{order.paymentStatus || "N/A"}</Text>
            </View>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">Shipping Status:</Text>
              <Text>{order.shippingStatus || "N/A"}</Text>
            </View>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">Product Subtotal:</Text>
              <Text>
                {order.productSubTotal
                  ? `$${order.productSubTotal.toFixed(2)}`
                  : "N/A"}
              </Text>
            </View>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">Product Total:</Text>
              <Text>
                {order.productTotal
                  ? `$${order.productTotal.toFixed(2)}`
                  : "N/A"}
              </Text>
            </View>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">Shipping Total:</Text>
              <Text>
                {order.shippingTotal
                  ? `$${order.shippingTotal.toFixed(2)}`
                  : "N/A"}
              </Text>
            </View>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">Tax Total:</Text>
              <Text>
                {order.taxTotal ? `$${order.taxTotal.toFixed(2)}` : "N/A"}
              </Text>
            </View>
            <View className="mb-2 flex flex-row justify-between">
              <Text className="text-muted-foreground">Order Total:</Text>
              <Text>
                {order.orderTotal ? `$${order.orderTotal.toFixed(2)}` : "N/A"}
              </Text>
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            {order.productItems && order.productItems.length > 0 ? (
              order.productItems.map((item, index) => (
                <View
                  key={index}
                  className="mb-2 flex flex-row justify-between"
                >
                  <Text>{item.productName || "Unknown Item"}</Text>
                  <Text>
                    {item.price ? `$${item.price.toFixed(2)}` : "N/A"} x{" "}
                    {item.quantity || 1}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-muted-foreground">No items found</Text>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
          </CardHeader>
          <CardContent>
            {order.billingAddress ? (
              <>
                <Text>{order.billingAddress.fullName || "N/A"}</Text>
                <Text>{order.billingAddress.address1 || "N/A"}</Text>
                <Text>
                  {order.billingAddress.city || "N/A"},{" "}
                  {order.billingAddress.stateCode || "N/A"}{" "}
                  {order.billingAddress.postalCode || "N/A"}
                </Text>
                <Text>{order.billingAddress.countryCode || "N/A"}</Text>
              </>
            ) : (
              <Text className="text-muted-foreground">
                No billing address provided
              </Text>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            {order.shippingAddress ? (
              <>
                <Text>{order.shippingAddress.fullName || "N/A"}</Text>
                <Text>{order.shippingAddress.address1 || "N/A"}</Text>
                <Text>
                  {order.shippingAddress.city || "N/A"},{" "}
                  {order.shippingAddress.stateCode || "N/A"}{" "}
                  {order.shippingAddress.postalCode || "N/A"}
                </Text>
                <Text>{order.shippingAddress.countryCode || "N/A"}</Text>
              </>
            ) : (
              <Text className="text-muted-foreground">
                No shipping address provided
              </Text>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            {order.shipments && order.shipments.length > 0 ? (
              order.shipments.map((shipment, index) => (
                <View key={index} className="mb-2">
                  <Text>Shipment ID: {shipment.id || "N/A"}</Text>
                  <Text>
                    Tracking Number: {shipment.trackingNumber || "N/A"}
                  </Text>
                  <Text>
                    Shipping Total:{" "}
                    {shipment.shippingTotal
                      ? `$${shipment.shippingTotal.toFixed(2)}`
                      : "N/A"}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-muted-foreground">
                No shipment information available
              </Text>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            {order.paymentInstruments && order.paymentInstruments.length > 0 ? (
              order.paymentInstruments.map((payment, index) => (
                <View key={index} className="mb-2">
                  <Text>
                    Payment Method: {payment.paymentMethodId || "N/A"}
                  </Text>
                  <Text>
                    Amount:{" "}
                    {payment.amount ? `$${payment.amount.toFixed(2)}` : "N/A"}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-muted-foreground">
                No payment information available
              </Text>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            {order.couponItems && order.couponItems.length > 0 ? (
              order.couponItems.map((coupon, index) => (
                <View key={index} className="mb-2">
                  <Text>Code: {coupon.code || "N/A"}</Text>
                  <Text>Status: {coupon.statusCode || "N/A"}</Text>
                </View>
              ))
            ) : (
              <Text className="text-muted-foreground">No coupons applied</Text>
            )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
