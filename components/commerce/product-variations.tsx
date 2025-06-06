import type { ShopperProductsTypes } from "commerce-sdk-isomorphic"
import { TouchableOpacity, View } from "react-native"
import { Badge } from "~/components/ui/badge"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

interface ProductVariationsProps {
  variationAttributes?: ShopperProductsTypes.VariationAttribute[]
  variants?: ShopperProductsTypes.Variant[]
  selectedVariations?: Record<string, string>
  onVariationChange?: (variations: Record<string, string>) => void
}

export function ProductVariations({
  variationAttributes,
  variants,
  selectedVariations = {},
  onVariationChange,
}: ProductVariationsProps) {
  const handleVariationSelect = (attributeId: string, value: string) => {
    const newVariations = { ...selectedVariations, [attributeId]: value }
    onVariationChange?.(newVariations)
  }

  // Helper function to check if a variation value is orderable
  const isVariationValueOrderable = (attributeId: string, value: string) => {
    if (!variants) return true

    // Check if any variant with this variation value is orderable
    return variants.some((variant) => variant.variationValues?.[attributeId] === value && variant.orderable !== false)
  }

  // Helper function to check if a variation value is available given current selections
  const isVariationValueAvailable = (attributeId: string, value: string) => {
    if (!variants) return true

    // Create a test selection with the current value
    const testSelection = { ...selectedVariations, [attributeId]: value }

    // Check if any variant matches this combination and is orderable
    return variants.some((variant) => {
      const matchesSelection = Object.entries(testSelection).every(
        ([attrId, attrValue]) => variant.variationValues?.[attrId] === attrValue,
      )
      return matchesSelection && variant.orderable !== false
    })
  }

  if (!variationAttributes || variationAttributes.length === 0) {
    return null
  }

  return (
    <>
      {variationAttributes.map((attribute) => {
        if (!attribute.id || !attribute.values) return null

        // Filter values to only show orderable ones
        const orderableValues = attribute.values.filter((value) =>
          isVariationValueOrderable(attribute.id!, value.value!),
        )

        if (orderableValues.length === 0) return null

        return (
          <View key={attribute.id} className="gap-3">
            <View className="flex-row items-center gap-2">
              <Text className="font-medium text-foreground">{attribute.name || attribute.id}</Text>
              {selectedVariations[attribute.id] && (
                <Badge variant="secondary" className="text-xs">
                  <Text className="text-xs text-secondary-foreground">
                    {orderableValues.find((v) => v.value === selectedVariations[attribute.id])?.name ||
                      selectedVariations[attribute.id]}
                  </Text>
                </Badge>
              )}
            </View>

            <View className="flex-row flex-wrap gap-2">
              {orderableValues.map((value, index) => {
                if (!value.value) return null

                const isSelected = selectedVariations[attribute.id] === value.value
                const isAvailable = isVariationValueAvailable(attribute.id!, value.value!)

                return (
                  <TouchableOpacity
                    key={`${attribute.id}-${value.value}-${index}`}
                    disabled={!isAvailable}
                    onPress={() => handleVariationSelect(attribute.id!, value.value!)}
                    className={cn(
                      "relative px-3 py-2 rounded-md border",
                      isSelected ? "bg-primary border-primary" : "bg-background border-border",
                      !isAvailable && "opacity-50",
                    )}
                  >
                    <Text
                      className={cn("text-sm font-medium", isSelected ? "text-primary-foreground" : "text-foreground")}
                    >
                      {value.name || value.value}
                    </Text>
                    {!isAvailable && (
                      <View className="absolute inset-0 flex items-center justify-center">
                        <View className="w-full h-px bg-destructive transform rotate-45" />
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Show count of available options */}
            {orderableValues.length > 0 && (
              <Text className="text-xs text-muted-foreground">
                {orderableValues.length} {orderableValues.length === 1 ? "option" : "options"} available
              </Text>
            )}
          </View>
        )
      })}
    </>
  )
}
