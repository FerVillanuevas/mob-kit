import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInLeft,
    SlideInUp,
    SlideOutDown,
    SlideOutRight,
} from 'react-native-reanimated';

type AnimationPreset = 'fade' | 'slide' | 'slideHorizontal';

interface AnimatedStateViewProps {
  /** Current state of your data/component */
  state: 'loading' | 'error' | 'empty' | 'success';
  
  /** Component to render when loading */
  loadingComponent?: React.ReactElement;
  
  /** Component to render when there's an error */
  errorComponent?: React.ReactElement;
  
  /** Component to render when data is empty */
  emptyComponent?: React.ReactElement;
  
  /** Component to render when everything is successful/has data */
  children: React.ReactElement;
  
  /** Animation duration in milliseconds */
  duration?: number;
  
  /** Animation preset */
  animationPreset?: AnimationPreset;
  
  /** Container style */
  style?: ViewStyle;
  
  /** Whether to use absolute positioning (prevents layout shifts) */
  absolute?: boolean;
}

const AnimatedStateView: React.FC<AnimatedStateViewProps> = ({
  state,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
  duration = 300,
  animationPreset = 'fade',
  style,
  absolute = true,
}) => {
  const getEnterAnimation = () => {
    switch (animationPreset) {
      case 'slide':
        return SlideInUp.duration(duration);
      case 'slideHorizontal':
        return SlideInLeft.duration(duration);
      case 'fade':
      default:
        return FadeIn.duration(duration);
    }
  };

  const getExitAnimation = () => {
    switch (animationPreset) {
      case 'slide':
        return SlideOutDown.duration(duration);
      case 'slideHorizontal':
        return SlideOutRight.duration(duration);
      case 'fade':
      default:
        return FadeOut.duration(duration);
    }
  };

  const containerStyle = absolute
    ? [{ flex: 1 }, style]
    : [{ flex: 1 }, style];

  const contentStyle = absolute
    ? { flex: 1, position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 }
    : { flex: 1 };

  return (
    <View style={containerStyle}>
      {/* Loading State */}
      {state === 'loading' && loadingComponent && (
        <Animated.View
          entering={getEnterAnimation()}
          exiting={getExitAnimation()}
          style={contentStyle}
        >
          {loadingComponent}
        </Animated.View>
      )}

      {/* Error State */}
      {state === 'error' && errorComponent && (
        <Animated.View
          entering={getEnterAnimation()}
          exiting={getExitAnimation()}
          style={contentStyle}
        >
          {errorComponent}
        </Animated.View>
      )}

      {/* Empty State */}
      {state === 'empty' && emptyComponent && (
        <Animated.View
          entering={getEnterAnimation()}
          exiting={getExitAnimation()}
          style={contentStyle}
        >
          {emptyComponent}
        </Animated.View>
      )}

      {/* Success State */}
      {state === 'success' && (
        <Animated.View
          entering={getEnterAnimation()}
          exiting={getExitAnimation()}
          style={contentStyle}
        >
          {children}
        </Animated.View>
      )}
    </View>
  );
};

export default AnimatedStateView;