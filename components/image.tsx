import { Image as ExImage } from 'expo-image';
import { cssInterop } from 'nativewind';
import { ComponentPropsWithoutRef } from 'react';

const StyledImage = cssInterop(ExImage, {
  className: 'style',
});

export default function Image(props: ComponentPropsWithoutRef<typeof StyledImage>) {
  return <StyledImage {...props} />;
}