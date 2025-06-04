import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem
} from "@react-navigation/drawer";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import Drawer from "expo-router/drawer";
import { View } from "react-native";
import { H4 } from "~/components/ui/typography";
import { getCategoryQueryOptions } from "~/integrations/salesforce/options/products";

const DrawerLinks = (props: DrawerContentComponentProps) => {
  const { data } = useQuery(
    getCategoryQueryOptions({
      id: "root",
      levels: 2,
    })
  );

  if (!data) {
    return <></>;
  }

  return (
    <DrawerContentScrollView>
      <DrawerItem
        onPress={() => {
          router.push({
            pathname: "/",
          });
        }}
        label="home"
      />

      {data?.categories?.map((category) => {
        return (
          <View key={category.id}>
            <H4>{category.name}</H4>
            {category.categories?.map((subCategory) => {
              return (
                <DrawerItem
                  key={subCategory.id}
                  onPress={() => {
                    router.push({
                      pathname: "/category/[id]",
                      params: {
                        id: subCategory.id,
                      },
                    });
                  }}
                  label={subCategory.name || subCategory.id}
                />
              );
            })}
          </View>
        );
      })}
    </DrawerContentScrollView>
  );
};

export default function StackLayout() {
  return <Drawer drawerContent={DrawerLinks} />;
}
