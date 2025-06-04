import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { ComponentPropsWithoutRef } from "react";
import { cn } from "~/lib/utils";

const StyledIcon = cssInterop(Ionicons, {
  className: "style",
});

export default function Icon({
  size = 18,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof StyledIcon>) {
  return (
    <StyledIcon
      className={cn("text-foreground", className)}
      size={size}
      {...props}
    />
  );
}
