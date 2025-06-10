import { ScrollView, View } from "react-native";
import { ComponentRenderer } from "~/components/experience/component-renderer";
import homepageData from "~/data/homepage.json";

export function PageRenderer() {
  const mainRegion = homepageData.regions.find(
    (region) => region.id === "main",
  );

  return (
    <ScrollView className="flex-1">
      <View className="pb-8">
        {mainRegion?.components?.map((component) => (
          <ComponentRenderer key={component.id} component={component} />
        ))}
      </View>
    </ScrollView>
  );
}
