import { ScrollView, View } from "react-native";
import HorizontalProducts from "~/components/commerce/horizontal-products";
import Icon from "~/components/icon";
import { H3 } from "~/components/ui/typography";

export default function Index() {
  return (
    <ScrollView>
      <View className="w-full aspect-square justify-center flex items-center bg-secondary">
        <H3>
          Made with <Icon name="heart" className="text-destructive" /> and Expo
        </H3>
      </View>

      <View className="gap-4 px-4 py-8">
        <HorizontalProducts category="newarrivals" title="New Arrivals" />

        <HorizontalProducts
          category="womens-clothing"
          title="Womans Clothing"
        />
      </View>
    </ScrollView>
  );
}
