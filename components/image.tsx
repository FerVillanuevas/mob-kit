import { Image as ExImage } from "expo-image";
import { cssInterop } from "nativewind";
import { ComponentPropsWithoutRef } from "react";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

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
