import { useHeaderHeight } from "@react-navigation/elements";
import { Tabs } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import Icon from "~/components/icon";

export default function CheckoutLayout() {
  const { width, height } = useWindowDimensions();
  const h = useHeaderHeight();

  return (
    <View style={{ width, height: height - h }}>
      <Tabs
        screenListeners={{
          tabPress: (e) => {
            e.preventDefault();
            return;
          },
        }}
      >
        <Tabs.Screen
          name="customer"
          options={{
            tabBarIcon: ({ focused }) => (
              <Icon name={focused ? "people" : "people-outline"} />
            ),
          }}
        />
        <Tabs.Screen
          name="address"
          options={{
            tabBarIcon: ({ focused }) => (
              <Icon name={focused ? "home" : "home-outline"} />
            ),
          }}
        />
        <Tabs.Screen
          name="shipping"
          options={{
            tabBarIcon: ({ focused }) => (
              <Icon name={focused ? "rocket" : "rocket-outline"} />
            ),
          }}
        />
        <Tabs.Screen
          name="payment"
          options={{
            tabBarIcon: ({ focused }) => (
              <Icon name={focused ? "card" : "card-outline"} />
            ),
          }}
        />
        <Tabs.Screen
          name="review"
          options={{
            tabBarIcon: ({ focused }) => (
              <Icon name={focused ? "receipt" : "receipt-outline"} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
