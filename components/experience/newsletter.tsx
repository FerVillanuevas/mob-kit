import { Check } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import Image from "~/components/image";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

interface NewsletterProps {
  component: {
    data: {
      title: string;
      subtitle: string;
      placeholder: string;
      ctaText: string;
      benefits: string[];
      backgroundImage: string;
    };
  };
}

export function Newsletter({ component }: NewsletterProps) {
  const { title, subtitle, placeholder, ctaText, benefits, backgroundImage } =
    component.data;
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    console.log("Subscribe with email:", email);
    // Handle newsletter subscription
    setEmail("");
  };

  return (
    <View className="mx-4 mb-8 overflow-hidden rounded-2xl shadow-lg">
      <View className="relative">
        <Image source={{ uri: backgroundImage }} className="h-80 w-full" />
        <View className="absolute inset-0 bg-black/70" />

        <View className="absolute inset-0 items-center justify-center p-6">
          <Text className="mb-2 text-center text-2xl font-bold text-white">
            {title}
          </Text>
          <Text className="mb-6 text-center leading-relaxed text-white/90">
            {subtitle}
          </Text>

          <View className="mb-6 w-full max-w-sm">
            <View className="flex-row gap-2">
              <Input
                className="flex-1 px-4 py-3"
                placeholder={placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Button variant='secondary' onPress={handleSubscribe}>
                <Text>{ctaText}</Text>
              </Button>
            </View>
          </View>

          <View className="gap-y-2">
            {benefits.map((benefit, index) => (
              <Badge key={index} className="flex-row items-center gap-2">
                <Check size={12} className="text-white" />
                <Text>{benefit}</Text>
              </Badge>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
