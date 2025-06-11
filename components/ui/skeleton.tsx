import { useEffect } from "react"
import type { ViewProps } from "react-native"
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import { cn } from "~/lib/utils"

interface SkeletonProps extends ViewProps {
  className?: string
  pulse?: boolean
}

export function Skeleton({ className, pulse = false, ...props }: SkeletonProps) {
  const opacity = useSharedValue(0.5)

  useEffect(() => {
    if (pulse) {
      opacity.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.6, 1) }), -1, true)
    } else {
      opacity.value = 0.5
    }

    return () => {
      cancelAnimation(opacity)
    }
  }, [pulse, opacity])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  return <Animated.View className={cn("bg-secondary", className)} style={animatedStyle} {...props} />
}
