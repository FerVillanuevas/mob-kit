import { useQuery } from "@tanstack/react-query";
import { ImageBackground } from "expo-image";
import { router, Tabs } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
import Icon from "~/components/icon";
import MaskedBlur from "~/components/ui/masked-blur";
import { AuthTypes } from "~/integrations/salesforce/enums";
import { getBasketQueryOptions } from "~/integrations/salesforce/options/basket";
import { getCustomerQueryOptions } from "~/integrations/salesforce/options/customer";

/* Main Tabs */
export default function TabsLayout() {
  const { width, height } = useWindowDimensions();

  const { data: customer, isLoading } = useQuery(getCustomerQueryOptions());

  const { data: basket } = useQuery(getBasketQueryOptions());

  if (isLoading) {
    /* Ensure customer is loaded */
    return (
      <ImageBackground source={require("assets/images/bg.png")}>
        <View
          className="flex items-center justify-end"
          style={{ width, height }}
        >
          <View className="inset-x-0 bottom-0 w-full pb-20 pt-32">
            <MaskedBlur />
            <ActivityIndicator />
          </View>
        </View>
      </ImageBackground>
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
        name="wishlist"
        listeners={{
          tabPress: (e) => {
            if (customer?.authType !== AuthTypes.REGISTERED) {
              e.preventDefault();
              router.push("/login");
            }
          },
        }}
        options={{
          title: "Wislist",
          tabBarIcon: ({ size, color, focused }) => (
            <Icon
              name={focused ? "heart" : "heart-outline"}
              size={size}
              color={color}
            />
          ),
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
