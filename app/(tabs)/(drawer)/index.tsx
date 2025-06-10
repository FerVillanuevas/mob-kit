import { useQuery } from "@tanstack/react-query";
import { ScrollView, View } from "react-native";
import HorizontalProducts from "~/components/commerce/horizontal-products";
import Icon from "~/components/icon";
import { H1, H3 } from "~/components/ui/typography";
import getProductRecsQueryOptions from "~/integrations/salesforce/options/einstein";

import { ExtensionStorage } from "@bacons/apple-targets";
import { DrawerActions } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import { useEffect } from "react";
import { PageRenderer } from "~/components/experience/page-render";
import Loading from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import useRootCategories from "~/hooks/use-root-categories";
import { getPageQueryOptions } from "~/integrations/salesforce/options/experience";

// Create a storage object with the App Group.
const storage = new ExtensionStorage(
  // Your app group identifier. Should match the values in the app.json and expo-target.config.json.
  "group.fervillanuevas.data",
);

export default function Index() {
  const navigation = useNavigation();

  const { data: categories } = useRootCategories();

  const { data } = useQuery(
    getProductRecsQueryOptions({
      recId: "viewed-recently-einstein",
    }),
  );

  const { data: page, isLoading } = useQuery(
    getPageQueryOptions({
      pageId: "homepage-example",
    }),
  );

  useEffect(() => {
    if (data) {
      storage.set("recommendations", JSON.stringify(data));
      ExtensionStorage.reloadWidget();
    }
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (page?.id) {
    /* You should pass the actual page from Commerce, those are demo components.
       build you own

       <PageRenderer page={page} />
    */
    return <PageRenderer />;
  }

  return (
    <ScrollView>
      <View className="flex aspect-square w-full items-center justify-center bg-secondary">
        <H3>
          Made with <Icon name="heart" className="text-destructive" /> and Expo
        </H3>
      </View>

      <View className="gap-6 px-4 py-8">
        <View className="gap-3">
          <View className="flex flex-row items-center justify-between">
            <H1>Discover</H1>

            <Button
              variant="link"
              onPress={() => {
                navigation.dispatch(DrawerActions.toggleDrawer());
              }}
            >
              <Text className="text-destructive">View all</Text>
            </Button>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex flex-row gap-3">
              {categories?.categories?.map((category) => {
                return (
                  <Button
                    key={category.id}
                    onPress={() => {
                      router.push({
                        pathname: "/category/[id]",
                        params: {
                          id: category.id,
                        },
                      });
                    }}
                  >
                    <Text>{category.name}</Text>
                  </Button>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <HorizontalProducts category="newarrivals" title="New Arrivals" />

        <HorizontalProducts
          category="womens-clothing"
          title="Womans Clothing"
        />
      </View>
    </ScrollView>
  );
}
