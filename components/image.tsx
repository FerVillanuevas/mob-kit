import { Image as ExImage } from "expo-image";
import { cssInterop } from "nativewind";
import { ComponentPropsWithoutRef } from "react";

const blurhash = "LKO2?U%2Tw=w]~RBVZRi};RPxuwH";

const StyledImage = cssInterop(ExImage, {
  className: "style",
});

export default function Image(
  props: ComponentPropsWithoutRef<typeof StyledImage>,
) {
  return (
    <StyledImage
      contentFit="cover"
      transition={400}
      placeholderContentFit="cover"
      placeholder={{ blurhash }}
      {...props}
    />
  );
}
