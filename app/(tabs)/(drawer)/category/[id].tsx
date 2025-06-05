/* Review this latter, loading state is horrible */

import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Drawer } from "react-native-drawer-layout";
import FiltersContent from "~/components/commerce/filter-content";
import ProductHit from "~/components/commerce/product-hit";
import Icon from "~/components/icon";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { H1, H4 } from "~/components/ui/typography";
import { getProductsQueryOptions } from "~/integrations/salesforce/options/products";
import { REQUESTED_LIMIT } from "~/lib/constants";

// Helper function to parse search params into the expected structure
const parseSearchParams = (params: Record<string, string | string[]>) => {
  const offset = Number(params.offset) || 0;
  const sort = params.sort as string | undefined;
  const refinements: Record<string, string[]> = {};

  // Extract refinements from params (everything except id, offset, sort)
  Object.entries(params).forEach(([key, value]) => {
    if (key !== "id" && key !== "offset" && key !== "sort") {
      if (Array.isArray(value)) {
        refinements[key] = value;
      } else if (typeof value === "string") {
        // Handle comma-separated values from Expo Router
        // Split by comma and filter out empty strings
        const values = value.split(",").filter((v) => v.trim() !== "");
        if (values.length > 0) {
          refinements[key] = values;
        }
      }
    }
  });

  return { offset, sort, refinements };
};

export default function CategoryPage() {
  const params = useLocalSearchParams<{
    id: string;
    sort?: string;
    refinements?: string;
  }>();
  const categoryId = params.id as string;

  // Parse search params exactly like web version
  const {
    offset = 0,
    sort = "best-matches",
    refinements = {},
  } = parseSearchParams(params);

  const [open, setOpen] = useState(false);

  // Build refine array for API - exactly like web version
  const refineArray = [`cgid=${categoryId}`];
  Object.entries(refinements).forEach(([attributeId, values]) => {
    if (values.length > 0) {
      // Join multiple values with pipe separator instead of creating separate entries
      const joinedValues = values.join("|");
      refineArray.push(`${attributeId}=${joinedValues}`);
    }
  });

  console.log("Refine array for API:", refineArray);

  const {
    data: products,
    isLoading,
    isFetching,
  } = useQuery(
    getProductsQueryOptions({
      refine: refineArray,
      sort: sort,
      limit: REQUESTED_LIMIT,
      offset: offset,
    }),
  );

  const navigate = (updateFn: (prev: any) => any) => {
    const currentSearch = { offset, sort, refinements };
    const newSearch = updateFn(currentSearch);

    // Build new params object
    const newParams: Record<string, string | string[] | undefined> = {
      id: categoryId,
    };

    // Add offset if not 0
    if (newSearch.offset && newSearch.offset !== 0) {
      newParams.offset = newSearch.offset.toString();
    }

    // Add sort if exists and not default
    if (newSearch.sort && newSearch.sort !== "best-matches") {
      newParams.sort = newSearch.sort;
    }

    // Add refinements - convert arrays to comma-separated strings for Expo Router
    if (
      newSearch.refinements &&
      Object.keys(newSearch.refinements).length > 0
    ) {
      Object.entries(newSearch.refinements).forEach(([key, values]) => {
        if (values.length > 0) {
          // Join with commas for URL serialization
          newParams[key] = values.join(",");
        }
      });
    }

    console.log("Navigating with params:", newParams);
    router.replace({
      pathname: "/category/[id]",
      params: newParams,
    });
  };

  const handleSelectedRefinement = (attributeId: string, value: string) => {
    console.log("Handling refinement:", attributeId, value);
    console.log("Current refinements:", refinements);

    const currentValues = refinements[attributeId] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    console.log("New values:", newValues);

    const newRefinements = { ...refinements };
    if (newValues.length === 0) {
      delete newRefinements[attributeId];
    } else {
      newRefinements[attributeId] = newValues;
    }

    console.log("New refinements:", newRefinements);

    navigate((prev) => ({
      ...prev,
      refinements:
        Object.keys(newRefinements).length > 0 ? newRefinements : undefined,
      offset: 0, // Reset to first page when filtering
    }));
  };

  const handleOnSortChange = (newSort: string) => {
    navigate((prev) => ({
      ...prev,
      sort: newSort,
      offset: 0, // Reset to first page when sorting
    }));
  };

  const handleClearFilters = () => {
    navigate((prev) => ({
      ...prev,
      refinements: undefined,
      offset: 0,
    }));
    setOpen(false);
  };

  // Calculate active filters count exactly like web
  const activeFiltersCount = Object.values(refinements).reduce(
    (acc, values) => acc + values.length,
    0,
  );

  // Use the current products data even while loading new data
  const productData = products;

  return (
    <Drawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      drawerPosition="right"
      drawerStyle={{ backgroundColor: "transparent" }}
      renderDrawerContent={() => {
        return (
          <BlurView style={StyleSheet.absoluteFill} tint="systemChromeMaterial">
            <ScrollView>
              <FiltersContent
                refinements={productData?.refinements || []}
                productSorts={productData?.sortingOptions || []}
                selectedRefinements={refinements}
                selectedSort={sort}
                handleSelectedRefinement={handleSelectedRefinement}
                handleOnSortChange={handleOnSortChange}
                handleClearFilters={handleClearFilters}
                isLoading={isLoading || isFetching}
              />
            </ScrollView>
          </BlurView>
        );
      }}
    >
      <FlashList
        data={productData?.hits}
        ListEmptyComponent={() => {
          if (isLoading) {
            return (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" />
                <Text className="mt-4 text-muted-foreground">
                  Loading products...
                </Text>
              </View>
            );
          }

          return (
            <View className="flex-1 items-center justify-center py-20">
              <Icon
                name="search"
                size={48}
                className="mb-4 text-muted-foreground"
              />
              <Text className="text-lg font-medium">No products found</Text>
              <Text className="mb-4 mt-2 max-w-xs text-center text-muted-foreground">
                Try adjusting your filters or search for something else
              </Text>
              <Button variant="outline" onPress={handleClearFilters}>
                <Text>Clear Filters</Text>
              </Button>
            </View>
          );
        }}
        ListHeaderComponent={() => {
          return (
            <View className="flex flex-row items-end justify-between p-4">
              <View>
                <H1>Products</H1>
                <H4>Total: {productData?.total || 0}</H4>
                {(isLoading || isFetching) && (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" className="mr-2" />
                    <Text className="text-xs text-muted-foreground">
                      Updating results...
                    </Text>
                  </View>
                )}
              </View>

              <Button
                size="sm"
                onPress={() => {
                  setOpen(true);
                }}
                className="flex-row items-center gap-2"
              >
                <Icon name="options" size={16} />
                <Text>Filters</Text>
                {activeFiltersCount > 0 && (
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-primary-foreground">
                    <Text className="text-xs text-primary">
                      {activeFiltersCount}
                    </Text>
                  </View>
                )}
              </Button>
            </View>
          );
        }}
        numColumns={2}
        estimatedItemSize={315}
        renderItem={({ item }) => {
          return (
            <ProductHit
              onPress={() => {
                router.push({
                  pathname: "/product/[id]",
                  params: {
                    id: item.productId,
                  },
                });
              }}
              product={item}
              className="w-full p-4"
            />
          );
        }}
      />
    </Drawer>
  );
}
