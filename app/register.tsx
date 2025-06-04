import { Input } from "~/components/ui/input";
import { useSalesforceAuth } from "~/hooks/use-salesforce-auth";

import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import KeyboardView from "~/components/keyboard-view";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { H1, P, Small } from "~/components/ui/typography";
import { RegisterFormData, RegisterSchema } from "~/lib/forms/customer";

export default function RegisterPage() {
  const { registerMutation } = useSalesforceAuth();

  const form = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  const handleFormSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({ data });
  };

  return (
    <KeyboardView>
      <View className="p-4 gap-3">
        <View>
          <H1>Create a new account</H1>
          <P>Login to your Acme Inc account</P>
        </View>

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

        <Button
          onPress={form.handleSubmit(handleFormSubmit)}
          disabled={registerMutation.isPending}
        >
          <View className="flex flex-row gap-3">
            {registerMutation.isPending && <ActivityIndicator size="small" />}
            <Text>Create account</Text>
          </View>
        </Button>

        <Small className="w-full text-center py-4 text-muted-foreground">
          Or
        </Small>

        <Button
          variant="outline"
          onPress={() => {
            router.back();
          }}
        >
          <Text>Back</Text>
        </Button>
      </View>
    </KeyboardView>
  );
}
