import { BrandStory } from "~/components/experience/brand-story";
import { CategoryShowcase } from "~/components/experience/category-showcase";
import { CollectionGrid } from "~/components/experience/collection-grid";
import { HeroBanner } from "~/components/experience/hero-banner";
import { Newsletter } from "~/components/experience/newsletter";
import { ProductCarousel } from "~/components/experience/product-carousel";
import { PromoBanner } from "~/components/experience/promo-banner";
import { Testimonials } from "~/components/experience/testimonials";

interface ComponentRendererProps {
  component: {
    id: string;
    typeId: string;
    data: any;
    regions?: any[];
  };
}

const COMPONENTS = {
  "modern_assets.heroBanner": HeroBanner,
  "modern_assets.categoryShowcase": CategoryShowcase,
  "modern_assets.productCarousel": ProductCarousel,
  "modern_assets.promoBanner": PromoBanner,
  "modern_assets.brandStory": BrandStory,
  "modern_assets.collectionGrid": CollectionGrid,
  "modern_assets.testimonials": Testimonials,
  "modern_assets.newsletter": Newsletter,
};

export function ComponentRenderer({ component }: ComponentRendererProps) {
  if (!component || !component.typeId) {
    return null;
  }

  const RenderComponent =
    COMPONENTS[component.typeId as keyof typeof COMPONENTS];

  if (!RenderComponent) {
    console.warn(`Unknown component type: ${component.typeId}`);
    return null;
  }

  return <RenderComponent component={component} />;
}
