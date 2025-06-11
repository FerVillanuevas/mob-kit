import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { ComponentPropsWithoutRef } from "react";
import { View } from "react-native";
import Icon from "~/components/icon";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { H1 } from "~/components/ui/typography";

type EmptyHeroProps = {
  iconName?: ComponentPropsWithoutRef<typeof Ionicons>["name"];
  title?: string;
  description?: string;
  buttonText?: string;
  redirectPath?: Href;
  hideButton?: boolean;
};

export default function EmptyHero({
  iconName = "nuclear-outline",
  title = "Your cart is empty",
  description = "Discover amazing products and add them to your cart to get started",
  buttonText = "Start Shopping",
  redirectPath = "/",
  hideButton = false,
}: EmptyHeroProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Icon name={iconName} size={80} className="mb-6 text-muted-foreground" />
      <H1 className="mb-3 text-center">{title}</H1>
      <Text className="mb-8 max-w-sm text-center text-muted-foreground">
        {description}
      </Text>
      {!hideButton && (
        <Button onPress={() => router.push(redirectPath)}>
          <View className="flex-row items-center gap-2">
            <Icon
              name="storefront"
              size={16}
              className="text-primary-foreground"
            />
            <Text>{buttonText}</Text>
          </View>
        </Button>
      )}
    </View>
  );
}
