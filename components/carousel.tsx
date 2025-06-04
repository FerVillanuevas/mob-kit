import { Galeria } from "@nandorojo/galeria";
import { useRef } from "react";
import { Animated, FlatList, View, useWindowDimensions } from "react-native";
import Image from "~/components/image";

import { cn } from "~/lib/utils";

export default function Carousel({ data }: { data: string[] }) {
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <View>
      <Galeria urls={data}>
        <FlatList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
            }
          )}
          scrollEventThrottle={32}
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
          {data.map((_, i) => {
            const input_range = [(i - 1) * width, i * width, (i + 1) * width];

            const opacity = scrollX.interpolate({
              inputRange: input_range,
              outputRange: [0.5, 1, 0.5],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={`media_${i}`}
                style={{ opacity }}
                className={cn("h-1.5 w-1.5 rounded-full bg-border")}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
