import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function QuantitySelector({
  value,
  onValueChange,
  min = 1,
  max = 999,
  disabled = false,
  className,
}: QuantitySelectorProps) {
  const handleIncrement = () => {
    if (!disabled && value < max) {
      onValueChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (!disabled && value > min) {
      onValueChange(value - 1);
    }
  };

  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && value < max;

  return (
    <View className={cn("flex flex-row", className)}>
      <Button
        onPress={handleDecrement}
        disabled={!canDecrement}
        size="icon"
        variant="outline"
      >
        <Text className="text-lg font-medium text-muted-foreground">−</Text>
      </Button>

      <View className="h-10 w-10 items-center justify-center">
        <Text className="text-base font-medium">{value}</Text>
      </View>

      <Button
        onPress={handleIncrement}
        disabled={!canIncrement}
        size="icon"
        variant="outline"
      >
        <Text className="text-lg font-medium text-muted-foreground">+</Text>
      </Button>
    </View>
  );
}
