import { Hero } from "@/components/sections/Hero";
import { Ethos } from "@/components/sections/Ethos";
import { Problem } from "@/components/sections/Problem";
import { Approach } from "@/components/sections/Approach";
import { PlatformGrid } from "@/components/sections/PlatformGrid";
import { DiscoveryTeaser } from "@/components/sections/DiscoveryTeaser";
import { ResearchTeaser } from "@/components/sections/ResearchTeaser";
import { ProductsTeaser } from "@/components/sections/ProductsTeaser";
import { Industries } from "@/components/sections/Industries";
import { Values } from "@/components/sections/Values";
import { CTA } from "@/components/sections/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Ethos />
      <Problem />
      <Approach />
      <PlatformGrid />
      <DiscoveryTeaser />
      <ResearchTeaser />
      <ProductsTeaser />
      <Industries />
      <Values />
      <CTA />
    </>
  );
}
