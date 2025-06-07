import { useQuery } from "@tanstack/react-query";
import { ScrollView, View } from "react-native";
import HorizontalProducts from "~/components/commerce/horizontal-products";
import Icon from "~/components/icon";
import { H3 } from "~/components/ui/typography";
import getProductRecsQueryOptions from "~/integrations/salesforce/options/einstein";

import { ExtensionStorage } from "@bacons/apple-targets";
import { useEffect } from "react";

// Create a storage object with the App Group.
const storage = new ExtensionStorage(
  // Your app group identifier. Should match the values in the app.json and expo-target.config.json.
  "group.fervillanuevas.data",
);

export default function Index() {
  const { data } = useQuery(
    getProductRecsQueryOptions({
      recId: "viewed-recently-einstein",
    }),
  );

  useEffect(() => {
    if (data) {
      storage.set("recommendations", JSON.stringify(data));
      ExtensionStorage.reloadWidget();
    }
  }, [data]);

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
