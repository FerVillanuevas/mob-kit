import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import AvoidingBlur from "~/components/avoiding-blur";
import Icon from "~/components/icon";
import KeyboardView from "~/components/keyboard-view";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { CardTypes } from "~/integrations/salesforce/enums";
import {
  getCustomerPaymentInstrumentQueryOptions,
  getCustomerQueryOptions,
  useCreateCustomerPaymentInstrumentMutation,
  useDeleteCustomerPaymentInstrumentMutation,
} from "~/integrations/salesforce/options/customer";
import {
  cleanCardNumber,
  detectCardType,
  formatCardNumberForDisplay,
} from "~/lib/commerce/utils";
import { PaymentCardFormData, PaymentCardSchema } from "~/lib/forms/customer";

export default function CustomerPaymentDetail() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const isNew = mode === "new";

  const { data: customer, isLoading: isLoadingCustomer } = useQuery(
    getCustomerQueryOptions(),
  );
  const { data: paymentInstrumentData, isLoading: isLoadingPayment } = useQuery(
    {
      ...getCustomerPaymentInstrumentQueryOptions(id),
      enabled: !isNew,
    },
  );

  const isLoading = isLoadingCustomer || (isLoadingPayment && !isNew);
  const createMutation = useCreateCustomerPaymentInstrumentMutation();
  const deleteMutation = useDeleteCustomerPaymentInstrumentMutation();

  const paymentInstrument = isNew
    ? null
    : paymentInstrumentData ||
      customer?.paymentInstruments?.find((pi) => pi.paymentInstrumentId === id);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentCardFormData>({
    resolver: zodResolver(PaymentCardSchema),
    defaultValues: paymentInstrument?.paymentCard
      ? {
          paymentMethodId: paymentInstrument.paymentMethodId || "CREDIT_CARD",
          cardType: paymentInstrument.paymentCard.maskedNumber || "",
          number:
            "************" + paymentInstrument.paymentCard.numberLastDigits,
          expirationMonth:
            paymentInstrument.paymentCard.expirationMonth?.toString() || "",
          expirationYear:
            paymentInstrument.paymentCard.expirationYear?.toString() || "",
          holder: paymentInstrument.paymentCard.holder || "",
        }
      : {
          paymentMethodId: randomUUID(),
          cardType: CardTypes.VISA, // Default to Visa
          number: "",
          expirationMonth: new Date().getMonth() + 1,
          expirationYear: new Date().getFullYear(),
          holder: "",
        },
  });

  const onSubmit = async (data: PaymentCardFormData) => {
    if (!isNew) {
      return router.back();
    }

    // Clean the card number before submission
    const cleanNumber = cleanCardNumber(data.number);

    await createMutation.mutateAsync({
      body: {
        //@ts-ignore
        paymentCard: {
          expirationYear: data.expirationYear,
          expirationMonth: data.expirationMonth,
          number: cleanNumber, // Use clean number
          holder: data.holder,
          cardType: data.cardType,
        },
        paymentMethodId: data.paymentMethodId,
      },
    });
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumberForDisplay(value);
    const clean = cleanCardNumber(formatted);

    // Auto-detect card type
    const detectedType = detectCardType(clean);
    if (detectedType) {
      setValue("cardType", detectedType);
    }

    return formatted;
  };

  const handleDelete = async () => {
    if (!isNew) {
      try {
        await deleteMutation.mutateAsync({ paymentInstrumentId: id });
        router.back();
      } catch (error) {
        console.error("Error deleting payment method:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <View className="flex flex-1 p-4">
        <Text className="mb-4 text-2xl font-bold">
          {isNew ? "Add New Payment Method" : "Edit Payment Method"}
        </Text>
        <View className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} className="flex flex-row items-center">
              <Skeleton className="h-6 w-1/4" pulse />
              <Skeleton className="ml-2 h-10 w-3/4" pulse />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!isNew && !paymentInstrument) {
    return (
      <View className="flex flex-1 items-center justify-center p-4">
        <Text className="text-lg text-muted-foreground">
          Payment method not found
        </Text>
        <Button onPress={() => router.back()} className="mt-4">
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex flex-1">
      <KeyboardView>
        <View className="flex flex-row items-center justify-between border-b-4 border-border p-4">
          <Text className="text-2xl font-bold">
            {isNew ? "Add New Payment Method" : "Payment Method"}
          </Text>
          <Button variant="ghost" onPress={() => router.back()}>
            <Icon name="close" size={20} />
          </Button>
        </View>
        <View className="gap-4 px-4 pb-32 pt-4">
          {/* Card Number - Place first for auto-detection */}
          <View className="gap-y-2">
            <Label htmlFor="number">Card Number</Label>
            <Controller
              control={control}
              name="number"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="number"
                  placeholder="1234 5678 9012 3456"
                  value={value}
                  onChangeText={(v) => {
                    const formatted = handleCardNumberChange(v);
                    onChange(formatted);
                  }}
                  editable={isNew}
                  onBlur={onBlur}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.number && (
              <Text className="text-sm text-destructive">
                {errors.number.message}
              </Text>
            )}
          </View>

          <View className="gap-y-2">
            <Label htmlFor="holder">Cardholder Name</Label>
            <Controller
              control={control}
              name="holder"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="holder"
                  placeholder="John Doe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={isNew}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.holder && (
              <Text className="text-sm text-destructive">
                {errors.holder.message}
              </Text>
            )}
          </View>

          <View className="flex flex-row gap-4">
            <View className="flex-1 gap-y-2">
              <Label htmlFor="expirationMonth">Exp. Month</Label>
              <Controller
                control={control}
                name="expirationMonth"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    id="expirationMonth"
                    placeholder="MM"
                    value={value?.toString().padStart(2, "0") || ""}
                    onChangeText={(text) => {
                      const num = parseInt(text);
                      if (!isNaN(num) && num >= 1 && num <= 12) {
                        onChange(num);
                      } else if (text === "") {
                        onChange(undefined);
                      }
                    }}
                    onBlur={onBlur}
                    editable={isNew}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                )}
              />
              {errors.expirationMonth && (
                <Text className="text-sm text-destructive">
                  {errors.expirationMonth.message}
                </Text>
              )}
            </View>
            <View className="flex-1 gap-y-2">
              <Label htmlFor="expirationYear">Exp. Year</Label>
              <Controller
                control={control}
                name="expirationYear"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    id="expirationYear"
                    placeholder="YYYY"
                    editable={isNew}
                    value={value?.toString() || ""}
                    onChangeText={(text) => {
                      const num = parseInt(text);
                      if (!isNaN(num) && num >= new Date().getFullYear()) {
                        onChange(num);
                      } else if (text === "") {
                        onChange(undefined);
                      }
                    }}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                )}
              />
              {errors.expirationYear && (
                <Text className="text-sm text-destructive">
                  {errors.expirationYear.message}
                </Text>
              )}
            </View>
          </View>
        </View>
      </KeyboardView>
      <AvoidingBlur
        bottom={0}
        className="pb-safe flex flex-row justify-between gap-3 px-4"
      >
        {!isNew && (
          <Button
            variant="destructive"
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Text>Delete</Text>
          </Button>
        )}
        <Button
          onPress={handleSubmit(onSubmit)}
          className="flex-1"
          disabled={createMutation.isPending}
        >
          <Text>{isNew ? "Create Payment Method" : "Back to payments"}</Text>
        </Button>
      </AvoidingBlur>
    </View>
  );
}
