import { Input } from "~/components/ui/input";
import { useSalesforceAuth } from "~/hooks/use-salesforce-auth";

import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import { z } from "zod";
import KeyboardView from "~/components/keyboard-view";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { H1, P, Small } from "~/components/ui/typography";

const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type LoginFromData = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const { loginMutation } = useSalesforceAuth();

  const form = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const handleFormSubmit = (data: LoginFromData) => {
    loginMutation.mutate(data);
  };

  return (
    <KeyboardView>
      <View className="p-4 gap-3">
        <View>
          <H1>Welcome back</H1>
          <P>Login to your Acme Inc account</P>
        </View>

        <View className="gap-2">
          <Label>Email</Label>
          <Controller
            control={form.control}
            name="username"
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
          disabled={loginMutation.isPending}
        >
          <View className="flex flex-row gap-3">
            {loginMutation.isPending && <ActivityIndicator size="small" />}
            <Text>Login</Text>
          </View>
        </Button>

        <Small className="w-full text-center py-4 text-muted-foreground">
          Or
        </Small>

        <Button
          variant="outline"
          onPress={() => {
            router.push("/register");
          }}
        >
          <Text>Create a new acount</Text>
        </Button>
      </View>
    </KeyboardView>
  );
}
