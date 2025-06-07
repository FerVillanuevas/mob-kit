import { Galeria } from "@nandorojo/galeria";
import { useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Image from "~/components/image";

import { cn } from "~/lib/utils";


export default function Carousel({ data }: { data: string[] }) {
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View>
      <Galeria urls={data}>
        <Animated.FlatList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          renderItem={({ item, index: i }) => {
            return (
              <View
                key={i}
                style={{
                  width,
                  height: width,
                }}
              >
                <Galeria.Image index={i}>
                  <Image source={item} className="h-full w-full" />
                </Galeria.Image>
              </View>
            );
          }}
        />
      </Galeria>

      {data && (
        <View className="absolute bottom-3 w-full flex flex-row gap-2 items-center justify-center">
          {data.map((_, i) => (
            <DotIndicator
              key={`media_${i}`}
              index={i}
              scrollX={scrollX}
              width={width}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// Separate component for each dot to optimize performance
function DotIndicator({
  index,
  scrollX,
  width,
}: {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className={cn("h-1.5 w-1.5 rounded-full bg-border")}
    />
  );
}