import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ShopperCustomersTypes } from "commerce-sdk-clean";
import { Redirect } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
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
    <ScrollView>
      <CustomerForm customer={customer} />

      <View className="p-4">
        <Button variant="destructive" onPress={handleLogOut}>
          <Text>Logout</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
