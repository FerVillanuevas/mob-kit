import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ShopperCustomersTypes } from "commerce-sdk-isomorphic";
import { Redirect, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { TouchableOpacity, View } from "react-native";
import Icon from "~/components/icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { H1, Muted } from "~/components/ui/typography";
import { useSalesforceAuth } from "~/hooks/use-salesforce-auth";
import { AuthTypes } from "~/integrations/salesforce/enums";
import { getCustomerQueryOptions } from "~/integrations/salesforce/options/customer";
import { CustomerSchema } from "~/lib/forms/customer";

const CustomerForm = ({
  customer,
}: {
  customer: ShopperCustomersTypes.Customer;
}) => {
  const form = useForm({
    defaultValues: {
      firstName: customer?.firstName,
      lastName: customer?.lastName,
    },
    resolver: zodResolver(CustomerSchema),
  });

  return (
    <View className="gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Personal Info</CardTitle>
          <CardDescription>Your basic personal details</CardDescription>
        </CardHeader>
        <CardContent className="gap-2">
          <View className="gap-2">
            <Label>First Name</Label>
            <Controller
              control={form.control}
              name="firstName"
              render={({ field }) => {
                return (
                  <Input
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    value={field.value}
                  />
                );
              }}
            />
          </View>

          <View className="gap-2">
            <Label>Last Name</Label>
            <Controller
              control={form.control}
              name="lastName"
              render={({ field }) => {
                return (
                  <Input
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    value={field.value}
                  />
                );
              }}
            />
          </View>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Your basic personal details</CardDescription>
        </CardHeader>
        <CardContent className="gap-2">
          <View className="gap-2">
            <Label>Email</Label>
            <Controller
              control={form.control}
              name="email"
              render={({ field }) => {
                return (
                  <Input
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    value={field.value}
                  />
                );
              }}
            />
          </View>

          <View className="gap-2">
            <Label>Phone</Label>
            <Controller
              control={form.control}
              name="phoneHome"
              render={({ field }) => {
                return (
                  <Input
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    value={field.value}
                  />
                );
              }}
            />
          </View>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Your basic personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <View className="gap-2">
            <Label>Password</Label>
            <Controller
              control={form.control}
              name="password"
              render={({ field }) => {
                return (
                  <Input
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    value={field.value}
                    secureTextEntry
                  />
                );
              }}
            />
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

export default function CustomerPage() {
  const { data: customer, isLoading } = useQuery(getCustomerQueryOptions());

  const { logoutMutation } = useSalesforceAuth();

  const handleLogOut = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return <></>;
  }

  if (customer?.authType !== AuthTypes.REGISTERED) {
    return <Redirect href="/" />;
  }

  return (
    <View className="flex flex-1">
      <View className="p-4 gap-2">
        <H1 numberOfLines={1}>{customer.firstName} {customer.lastName}</H1>
        <Muted>Lorem, ipsum dolor sit amet consectetur adipisicing elit.</Muted>
      </View>

      <Separator className="h-1" />

      <View className="flex flex-1 flex-col">
        <TouchableOpacity
          onPress={() => {
            router.push('/customer/orders')
          }}
          className="border-b border-border px-4 py-8"
        >
          <View className="flex flex-row items-center gap-4">
            <Icon name="basket" size={22} />
            <Text>My orders</Text>
          </View>
        </TouchableOpacity>

        <Separator className="h-1" />

        <TouchableOpacity
          onPress={() => {}}
          className="border-b border-border px-4 py-8"
        >
          <View className="flex flex-row items-center gap-4">
            <Icon name="people" size={22} />
            <Text>Account details</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.push('/customer/address')
          }}
          className="border-b border-border px-4 py-8"
        >
          <View className="flex flex-row items-center gap-4">
            <Icon name="home" size={22} />
            <Text>Address</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {}}
          className="border-b border-border px-4 py-8"
        >
          <View className="flex flex-row items-center gap-4">
            <Icon name="card" size={22} />
            <Text>Payments</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleLogOut} className="px-4 py-8">
        <View className="flex flex-row items-center gap-4">
          <Icon name="exit" size={22} className="text-destructive" />
          <Text className="text-destructive">Log out</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
