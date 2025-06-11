import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";
import AvoidingBlur from "~/components/avoiding-blur";
import Icon from "~/components/icon";
import KeyboardView from "~/components/keyboard-view";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import {
  getCustomerQueryOptions,
  useCreateCustumerAddressMutation,
  useDeleteCustomerAddressMutation,
  useUpdateCustomerAddressMutation,
} from "~/integrations/salesforce/options/customer";

const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  stateCode: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  countryCode: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function CustomerAddressDetail() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const isNew = mode === "new";

  const { data: customer, isLoading } = useQuery(getCustomerQueryOptions());
  const createMutation = useCreateCustumerAddressMutation();
  const updateMutation = useUpdateCustomerAddressMutation();
  const deleteMutation = useDeleteCustomerAddressMutation();

  const address = isNew
    ? null
    : customer?.addresses?.find((addr) => addr.addressId === id);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address || {
      firstName: "",
      lastName: "",
      address1: "",
      address2: "",
      city: "",
      stateCode: "",
      postalCode: "",
      countryCode: "",
      phone: "",
    },
  });

  const onSubmit = async (data: AddressFormData) => {
    try {
      if (isNew) {
        await createMutation.mutateAsync({
          body: { ...data, addressId: randomUUID() },
        });
      } else {
        await updateMutation.mutateAsync({ body: { ...data, addressId: id } });
      }
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleDelete = async () => {
    if (!isNew) {
      try {
        await deleteMutation.mutateAsync({ addressId: id });
      } catch (error) {
        console.error("Error deleting address:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <View className="flex flex-1 p-4">
        <Text className="mb-4 text-2xl font-bold">
          {isNew ? "Add New Address" : "Edit Address"}
        </Text>
        <View className="space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <View key={index} className="flex flex-row items-center">
              <Skeleton className="h-6 w-1/4" pulse />
              <Skeleton className="ml-2 h-10 w-3/4" pulse />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!isNew && !address) {
    return (
      <View className="flex flex-1 items-center justify-center p-4">
        <Text className="text-lg text-muted-foreground">Address not found</Text>
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
            {isNew ? "Add New Address" : "Edit Address"}
          </Text>
          <Button variant="ghost" onPress={() => router.back()}>
            <Icon name="close" size={20} />
          </Button>
        </View>
        <View className="gap-4 px-4 pb-32 pt-4">
          <View className="gap-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.firstName && (
              <Text className="text-sm text-destructive">
                {errors.firstName.message}
              </Text>
            )}
          </View>
          <View className="gap-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.lastName && (
              <Text className="text-sm text-destructive">
                {errors.lastName.message}
              </Text>
            )}
          </View>
          <View className="gap-y-2">
            <Label htmlFor="address1">Address Line 1</Label>
            <Controller
              control={control}
              name="address1"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="address1"
                  placeholder="Enter address line 1"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.address1 && (
              <Text className="text-sm text-destructive">
                {errors.address1.message}
              </Text>
            )}
          </View>
          <View className="gap-y-2">
            <Label htmlFor="address2">Address Line 2 (Optional)</Label>
            <Controller
              control={control}
              name="address2"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="address2"
                  placeholder="Enter address line 2"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>
          <View className="gap-y-2">
            <Label htmlFor="city">City</Label>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.city && (
              <Text className="text-sm text-destructive">
                {errors.city.message}
              </Text>
            )}
          </View>
          <View className="gap-y-2">
            <Label htmlFor="stateCode">State/Province</Label>
            <Controller
              control={control}
              name="stateCode"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="stateCode"
                  placeholder="Enter state or province"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.stateCode && (
              <Text className="text-sm text-destructive">
                {errors.stateCode.message}
              </Text>
            )}
          </View>
          <View className="gap-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Controller
              control={control}
              name="postalCode"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="postalCode"
                  placeholder="Enter postal code"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.postalCode && (
              <Text className="text-sm text-destructive">
                {errors.postalCode.message}
              </Text>
            )}
          </View>
          <View className="gap-y-2">
            <Label htmlFor="countryCode">Country</Label>
            <Controller
              control={control}
              name="countryCode"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="countryCode"
                  placeholder="Enter country"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.countryCode && (
              <Text className="text-sm text-destructive">
                {errors.countryCode.message}
              </Text>
            )}
          </View>
          <View className="gap-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
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
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          <Text>{isNew ? "Create Address" : "Update Address"}</Text>
        </Button>
      </AvoidingBlur>
    </View>
  );
}
