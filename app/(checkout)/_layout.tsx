import Icon from "~/components/icon";
import { MaterialTopTabs } from "~/components/top-tabs";

/*   const steps = [
    { id: 0, name: "Contact Info" },
    { id: 1, name: "Shipping Address" },
    { id: 2, name: "Shipping Options" },
    { id: 3, name: "Payment" },
    { id: 4, name: "Review" },
  ]; */

export default function CheckoutLayout() {
  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarShowLabel: false,
        swipeEnabled: false,
        lazy: true,
      }}
      screenListeners={{
        tabPress: (e) => {
          e.preventDefault();
          return;
        },
      }}
    >
      <MaterialTopTabs.Screen
        name="customer"
        options={{
          tabBarIcon: () => <Icon name="people" />,
        }}
      />
      <MaterialTopTabs.Screen
        name="address"
        options={{
          tabBarIcon: () => <Icon name="home" />,
        }}
      />
      <MaterialTopTabs.Screen
        name="shipping"
        options={{
          tabBarIcon: () => <Icon name="rocket-outline" />,
        }}
      />
      <MaterialTopTabs.Screen
        name="payment"
        options={{
          tabBarIcon: () => <Icon name="card" />,
        }}
      />
      <MaterialTopTabs.Screen
        name="review"
        options={{
          tabBarIcon: () => <Icon name="receipt-outline" />,
        }}
      />
    </MaterialTopTabs>
  );
}
