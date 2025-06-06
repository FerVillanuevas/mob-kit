import { useQuery } from "@tanstack/react-query";
import { ScrollView, View } from "react-native";
import HorizontalProducts from "~/components/commerce/horizontal-products";
import Icon from "~/components/icon";
import { H3 } from "~/components/ui/typography";
import getProductRecsQueryOptions from "~/integrations/salesforce/options/einstein";

export default function Index() {
  const { data } = useQuery(
    getProductRecsQueryOptions({
      recId: "viewed-recently-einstein",
    }),
  );

  return (
    <ScrollView>
      <View className="flex aspect-square w-full items-center justify-center bg-secondary">
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
