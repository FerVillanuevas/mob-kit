import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import AvoidingBlur from "~/components/avoiding-blur";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { getSearchSuggestionsOptions } from "~/integrations/salesforce/options/search";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data } = useQuery(
    getSearchSuggestionsOptions({
      q: searchQuery,
    })
  );

  return (
    <View className="flex flex-1 p-4">
      <FlashList
        data={data?.productSuggestions?.products}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/product/[id]",
                  params: {
                    id: item.productId,
                  },
                });
              }}
              className="p-4 border border-border rounded-md mb-4"
            >
              <Text>{item.productName}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <AvoidingBlur bottom={0} style={{ paddingBottom: 8 }}>
        <Input onChangeText={setSearchQuery} />
      </AvoidingBlur>
    </View>
  );
}
