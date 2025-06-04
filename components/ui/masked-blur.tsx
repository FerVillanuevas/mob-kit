import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { easeGradient } from "react-native-easing-gradient";
export default function MaskedBlur({
  colorStops,
  inverted,
}: {
  colorStops?: any;
  inverted?: boolean;
}) {
  const { colors, locations } = inverted
    ? easeGradient({
        colorStops: colorStops || {
          1: { color: "transparent" },
          0.5: { color: "#000" },
          0: { color: "#000" },
        },
      })
    : easeGradient({
        colorStops: colorStops || {
          0: { color: "transparent" },
          0.5: { color: "#000" },
          1: { color: "#000" },
        },
      });

  return (
    <MaskedView
      maskElement={
        <LinearGradient
          colors={colors as [string, string, ...string[]]}
          locations={locations as [number, number, ...number[]]}
          style={StyleSheet.absoluteFill}
        />
      }
      style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
    >
      <BlurView
        tint="systemMaterial"
        style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
      />
    </MaskedView>
  );
}
