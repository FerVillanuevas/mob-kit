// hooks/use-salesforce-auth.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMergeBasketMutation } from "~/integrations/salesforce/options/basket";
import {
  authenticateCustomer,
  logoutCustomer,
  registerCustomer,
} from "~/integrations/salesforce/server/customer";
import { RegisterFormData } from "~/lib/forms/customer";

export function useSalesforceAuth() {
  const queryClient = useQueryClient();
  const mergeBasketMutation = useMergeBasketMutation();

  const loginMutation = useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => authenticateCustomer({ data: { username, password } }),
    onSuccess: async () => {
      await mergeBasketMutation.mutateAsync();

      await queryClient.invalidateQueries();

      router.replace("/");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (formData: { data: RegisterFormData }) =>
      registerCustomer(formData),
    onSuccess: async () => {
      queryClient.invalidateQueries();
      router.replace("/");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => logoutCustomer(),
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.replace("/");
    },
  });

  return {
    loginMutation,
    logoutMutation,
    registerMutation,
  };
}
