import { ShopperSearchTypes } from "commerce-sdk-isomorphic";
import currency from "currency.js";
import {
    TouchableOpacity,
    TouchableOpacityProps,
    View,
} from "react-native";
import Image from "~/components/image";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

export default function ProductHit({
  product,
  className,
  ...rest
}: {
  product: ShopperSearchTypes.ProductSearchHit;
} & TouchableOpacityProps) {
  return (
    <TouchableOpacity {...rest} className={cn("mr-4 w-48 gap-4", className)}>
      {product.image?.disBaseLink ? (
        <Image
          source={product.image?.disBaseLink}
          className="aspect-[8/11] w-full rounded-md border border-zinc-300/20 dark:border-white/20"
        />
      ) : (
        <View className="aspect-[8/11] w-full rounded-md bg-slate-300" />
      )}

      <View className="w-full flex-row justify-between gap-2">
        <Text numberOfLines={1} className="flex-1 font-semibold">
          {product.productName}
        </Text>
        <Text numberOfLines={1}>{currency(product.price || 0).format()}</Text>
      </View>
    </TouchableOpacity>
  );
}
