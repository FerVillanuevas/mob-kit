import { useQuery } from "@tanstack/react-query";
import { router, Tabs } from "expo-router";
import { ActivityIndicator, Pressable, View } from "react-native";
import Icon from "~/components/icon";
import { AuthTypes } from "~/integrations/salesforce/enums";
import { getBasketQueryOptions } from "~/integrations/salesforce/options/basket";
import { getCustomerQueryOptions } from "~/integrations/salesforce/options/customer";

/* Main Tabs */
export default function TabsLayout() {
  const { data: customer, isLoading } = useQuery(getCustomerQueryOptions());

  const { data: basket } = useQuery(getBasketQueryOptions());

  if (isLoading) {
    /* Ensure customer is loaded */
    return (
      <View className="flex flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="(drawer)"
        options={{
          headerShown: false,
          title: "(drawer)",
          tabBarIcon: ({ size, color, focused }) => (
            <Icon
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarButton: ({ onPress, ...props }) => {
            return (
              /* Reset the drawer */
              <Pressable
                onPress={() => {
                  router.replace("/");
                }}
                {...props}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ size, color, focused }) => (
            <Icon
              name={focused ? "basket" : "basket-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarBadge: basket?.productItems?.length || undefined,
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ size, color, focused }) => (
            <Icon
              name={focused ? "search" : "search-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="customer"
        redirect={customer?.authType !== AuthTypes.REGISTERED}
        options={{
          title: "Profile",
          tabBarIcon: ({ size, color, focused }) => (
            <Icon
              name={focused ? "people" : "people-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="login"
        redirect={customer?.authType === AuthTypes.REGISTERED}
        options={{
          title: "Login",
          tabBarIcon: ({ size, color, focused }) => (
            <Icon
              name={focused ? "people" : "people-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
