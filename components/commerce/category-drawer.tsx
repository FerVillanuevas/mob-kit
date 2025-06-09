import { Ionicons } from "@expo/vector-icons";
import { type DrawerContentComponentProps } from "@react-navigation/drawer";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ComponentPropsWithoutRef } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Icon from "~/components/icon";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { H3 } from "~/components/ui/typography";
import { getCategoryQueryOptions } from "~/integrations/salesforce/options/products";
import { cn } from "~/lib/utils";

interface DrawerItemProps {
  label: string;
  icon?: ComponentPropsWithoutRef<typeof Ionicons>["name"];
  onPress: () => void;
  isSubItem?: boolean;
}

const DrawerItem = ({
  label,
  icon,
  onPress,
  isSubItem = false,
}: DrawerItemProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-3 px-4 py-3 active:bg-muted/50",
        isSubItem && "pl-8",
      )}
      activeOpacity={0.7}
    >
      {icon && !isSubItem && (
        <Icon name={icon} size={20} className="text-muted-foreground" />
      )}
      <Text
        className={cn(
          "flex-1",
          isSubItem ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {label}
      </Text>
      {!isSubItem && (
        <Icon
          name="chevron-forward"
          size={16}
          className="text-muted-foreground"
        />
      )}
    </TouchableOpacity>
  );
};

const CategorySkeleton = () => (
  <View className="py-4">
    {[1, 2, 3].map((i) => (
      <View key={i} className="mb-4">
        <Skeleton className="mx-4 mb-2 h-5 w-24" pulse />
        {[1, 2].map((j) => (
          <Skeleton key={j} className="mx-4 mb-1 h-10 w-full" pulse />
        ))}
      </View>
    ))}
  </View>
);

export const CategoryDrawer = (props: DrawerContentComponentProps) => {
  const { data, isLoading } = useQuery(
    getCategoryQueryOptions({
      id: "root",
      levels: 2,
    }),
  );

  return (
    <View className="pt-safe flex-1">
      {/* Simple Header */}
      <View className="border-b-4 border-border px-4 py-6">
        <H3 className="font-semibold">Menu</H3>
        <Text className="mt-1 text-sm text-muted-foreground">
          Browse our collection
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Home */}
        <View className="py-4">
          <DrawerItem
            label="Home"
            icon="home"
            onPress={() => {
              router.push("/");
              props.navigation.closeDrawer();
            }}
          />
        </View>

        <Separator className="mx-4" />

        {/* Categories */}
        {isLoading ? (
          <CategorySkeleton />
        ) : (
          <View className="py-4">
            {data?.categories?.map((category) => {
              const hasSubcategories =
                category.categories && category.categories.length > 0;

              if (!hasSubcategories) {
                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => {
                      router.push({
                        pathname: "/category/[id]",
                        params: {
                          id: category.id,
                        },
                      });
                    }}
                    className="flex-row items-center gap-3 px-4 py-3 active:bg-muted/50"
                  >
                    <Text className="flex-1 font-medium text-foreground">
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              }

              return (
                <Collapsible key={category.id}>
                  <CollapsibleTrigger className="flex-row items-center gap-3 px-4 py-3 active:bg-muted/50">
                    <Text className="flex-1 font-medium text-foreground">
                      {category.name}
                    </Text>
                    {hasSubcategories && (
                      <Icon
                        name="chevron-forward"
                        size={16}
                        className="text-muted-foreground"
                      />
                    )}
                  </CollapsibleTrigger>

                  {/* Subcategories */}
                  <CollapsibleContent>
                    {category.categories?.map((subCategory) => (
                      <DrawerItem
                        key={subCategory.id}
                        label={subCategory.name || subCategory.id}
                        isSubItem
                        onPress={() => {
                          router.push({
                            pathname: "/category/[id]",
                            params: { id: subCategory.id },
                          });
                          props.navigation.closeDrawer();
                        }}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
