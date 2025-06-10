import Drawer from "expo-router/drawer";
import { CategoryDrawer } from "~/components/commerce/category-drawer";

export default function StackLayout() {
  return (
    <Drawer
      drawerContent={CategoryDrawer}
      screenOptions={{
        drawerType: "slide",
      }}
    />
  );
}
