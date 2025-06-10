"use client"

import { FlashList } from "@shopify/flash-list"
import { useQuery } from "@tanstack/react-query"
import { router, useLocalSearchParams } from "expo-router"
import { cssInterop } from "nativewind"
import { useState } from "react"
import { ScrollView, View } from "react-native"
import { Drawer } from "react-native-drawer-layout"
import FiltersContent from "~/components/commerce/filter-content"
import { HeaderSkeleton } from "~/components/commerce/header-skeleton"
import { Pagination } from "~/components/commerce/pagination"
import ProductHit from "~/components/commerce/product-hit"
import { ProductGridSkeleton } from "~/components/commerce/product-skeleton"
import Icon from "~/components/icon"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import { H1, H4 } from "~/components/ui/typography"
import { getProductsQueryOptions } from "~/integrations/salesforce/options/products"
import {
  buildRefineArray,
  debugUrlParams,
  parseUrlParams,
  serializeSearchParams,
  type PLPSearchParams,
} from "~/lib/commerce/url-params"
import { REQUESTED_LIMIT } from "~/lib/constants"

const StyledDrawer = cssInterop(Drawer, {
  className: "drawerStyle",
})

export default function CategoryPage() {
  const params = useLocalSearchParams()
  const categoryId = params.id as string

  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    debugUrlParams(params, "mobile")
  }

  // Parse URL parameters using shared utility (standardized on web format)
  const { offset = 0, sort = "best-matches", refinements = {} } = parseUrlParams(params)


  console.log(offset);

  const [open, setOpen] = useState(false)

  // Build refine array for API using shared utility
  const refineArray = buildRefineArray(categoryId, refinements)

  const {
    data: products,
    isLoading,
    isFetching,
    refetch,
  } = useQuery(
    getProductsQueryOptions({
      refine: refineArray,
      sort: sort,
      limit: REQUESTED_LIMIT,
      offset: offset,
    }),
  )

  const navigate = (updateFn: (prev: PLPSearchParams) => PLPSearchParams) => {
    const currentSearch = { offset, sort, refinements }
    const newSearch = updateFn(currentSearch)

    // Serialize params for mobile using shared utility (standardized on web format)
    const serializedParams = serializeSearchParams(newSearch, "mobile")

    // Debug logging for navigation
    if (process.env.NODE_ENV === "development") {
      console.log("[MOBILE] Navigating with params:", serializedParams)
    }

    router.replace({
      pathname: "/category/[id]",
      params: {
        id: categoryId,
        ...serializedParams,
      },
    })
  }

  const handleSelectedRefinement = (attributeId: string, value: string) => {
    const currentValues = refinements[attributeId] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]

    const newRefinements = { ...refinements }
    if (newValues.length === 0) {
      delete newRefinements[attributeId]
    } else {
      newRefinements[attributeId] = newValues
    }

    navigate((prev) => ({
      ...prev,
      refinements: Object.keys(newRefinements).length > 0 ? newRefinements : {},
      offset: 0, // Reset to first page when filtering
    }))
  }

  const handleOnSortChange = (newSort: string) => {
    navigate((prev) => ({
      ...prev,
      sort: newSort,
      offset: 0, // Reset to first page when sorting
    }))
  }

  const handleClearFilters = () => {
    navigate((prev) => ({
      ...prev,
      refinements: {},
      offset: 0,
    }))
    setOpen(false)
  }

  // Calculate active filters count
  const activeFiltersCount = Object.values(refinements).reduce((acc, values) => acc + values.length, 0)

  const productData = products
  const isInitialLoading = isLoading && !productData

  const handleAddToWishlist = () => {}

  return (
    <StyledDrawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      className="bg-background"
      drawerPosition="right"
      renderDrawerContent={() => {
        return (
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
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
        )
      }}
    >
      <FlashList
        data={productData?.hits}
        ListEmptyComponent={() => {
          if (isInitialLoading) {
            return (
              <View className="flex-1">
                <HeaderSkeleton />
                <ProductGridSkeleton numColumns={2} numItems={6} />
              </View>
            )
          }

          return (
            <View className="flex-1 items-center justify-center px-6 py-20">
              <Icon name="search" size={48} className="mb-6 text-muted-foreground" />
              <Text className="mb-2 text-center text-xl font-medium">No products found</Text>
              <Text className="mb-8 text-center text-muted-foreground">
                Try adjusting your filters or search for something else
              </Text>
              <Button variant="outline" onPress={handleClearFilters} className="min-w-[180px]">
                <Icon name="refresh" size={16} className="mr-2" />
                <Text>Clear Filters</Text>
              </Button>
            </View>
          )
        }}
        ListHeaderComponent={() => {
          return (
            <View className="mb-2 flex-row items-end justify-between p-4">
              <View>
                <H1>Products</H1>
                <View className="mt-1 flex-row items-center">
                  <H4 className="text-muted-foreground">
                    {productData?.total ? `${productData.total} results` : "Loading results..."}
                  </H4>
                  {isFetching && !isInitialLoading && (
                    <View className="ml-2">
                      <Skeleton className="h-4 w-4 rounded-full" pulse />
                    </View>
                  )}
                </View>
              </View>

              <Button
                size="sm"
                onPress={() => {
                  setOpen(true)
                }}
                className="flex-row items-center gap-2 shadow-sm"
              >
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive">
                    <Text>{activeFiltersCount}</Text>
                  </Badge>
                )}
                <Text>Filters</Text>
              </Button>
            </View>
          )
        }}
        numColumns={2}
        estimatedItemSize={315}
        renderItem={({ item }) => {
          return (
            <ProductHit
              showWishList
              onPress={() => {
                router.push({
                  pathname: "/product/[id]",
                  params: {
                    id: item.productId,
                  },
                })
              }}
              onWishListToggle={handleAddToWishlist}
              product={item}
              className="w-full p-4"
            />
          )
        }}
        ListFooterComponent={() => (
          <View className="px-4 py-6">
            <Pagination
              total={productData?.total || 0}
              offset={offset}
              requestedLimit={REQUESTED_LIMIT}
              navigate={navigate}
            />
          </View>
        )}
        refreshing={isFetching && !isInitialLoading}
        onRefresh={() => {
          refetch()
        }}
      />
    </StyledDrawer>
  )
}
