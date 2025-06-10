import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, View } from "react-native";
import Image from "~/components/image";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Muted } from "~/components/ui/typography";

interface HeroBannerProps {
  component: {
    data: {
      title: string;
      subtitle: string;
      ctaText: string;
      ctaLink: string;
      backgroundImage: {
        url: string;
        alt: string;
      };
      overlayOpacity: number;
      textPosition: string;
    };
  };
}

export function HeroBanner({ component }: HeroBannerProps) {
  const { title, subtitle, ctaText, backgroundImage, overlayOpacity } =
    component.data;
  const { width } = Dimensions.get("window");

  return (
    <View className="relative mb-6 h-96">
      <Image source={{ uri: backgroundImage.url }} className="h-full w-full" />
      <LinearGradient
        colors={[
          `rgba(0,0,0,${overlayOpacity})`,
          `rgba(0,0,0,${overlayOpacity * 0.6})`,
        ]}
        className="absolute inset-0"
      />
      <View className="absolute inset-0 items-center justify-center px-6">
        <Text className="mb-4 text-primary-foreground text-center text-4xl font-bold leading-tight">
          {title}
        </Text>
        <Muted className="mb-8 max-w-sm text-center text-lg leading-relaxed">
          {subtitle}
        </Muted>
        <Button variant="secondary">
          <Text>{ctaText}</Text>
        </Button>
      </View>
    </View>
  );
}
