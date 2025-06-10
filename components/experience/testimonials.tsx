import { Star } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import Image from "~/components/image";
import { Text } from "~/components/ui/text";
import { Muted } from "~/components/ui/typography";

interface TestimonialsProps {
  component: {
    data: {
      title: string;
      testimonials: Array<{
        id: string;
        name: string;
        avatar: string;
        rating: number;
        text: string;
        location: string;
      }>;
    };
  };
}

export function Testimonials({ component }: TestimonialsProps) {
  const { title, testimonials } = component.data;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color={index < rating ? "#fbbf24" : "#e5e7eb"}
        fill={index < rating ? "#fbbf24" : "#e5e7eb"}
      />
    ));
  };

  return (
    <View className="mb-8">
      <Text className="mb-6 px-4 text-center text-2xl font-bold">{title}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pl-4"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {testimonials.map((testimonial) => (
          <View
            key={testimonial.id}
            className="mr-4 w-80 rounded-2xl border border-border bg-card p-6"
          >
            <View className="mb-4 flex-row items-center">
              <Image
                source={{ uri: testimonial.avatar }}
                className="mr-4 h-12 w-12 rounded-full"
              />
              <View className="flex-1">
                <Text className="mb-1 font-semibold">{testimonial.name}</Text>
                <Muted className="text-sm">{testimonial.location}</Muted>
              </View>
            </View>

            <View className="mb-4 flex-row">
              {renderStars(testimonial.rating)}
            </View>

            <Muted className="leading-relaxed">"{testimonial.text}"</Muted>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
