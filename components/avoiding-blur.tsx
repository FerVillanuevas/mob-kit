import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import MaskedBlur from "~/components/ui/masked-blur";
import { cn } from "~/lib/utils";

export default function AvoidingBlur({
  children,
  bottom,
  className,
  style,
}: {
  children: ReactNode;
  bottom?: number;
  className?: string;
  style?: ViewStyle;
}) {
  return (
    <KeyboardAvoidingView
      behavior="position"
      keyboardVerticalOffset={100}
      className="absolute inset-x-0"
      style={{ bottom }}
    >
      <MaskedBlur />
      <View style={style} className={cn("px-3 pb-3 pt-8", className)}>
        {children}
      </View>
    </KeyboardAvoidingView>
  );
}
