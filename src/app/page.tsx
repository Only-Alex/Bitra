import { Nav } from "@/components/Nav";
import { NavMotion } from "@/components/NavMotion";
import { MarketStrip } from "@/components/MarketStrip";
import { TickerTape } from "@/components/TickerTape";
import { Preloader } from "@/components/Preloader";
import { Cursor } from "@/components/Cursor";
import { Blurbs } from "@/components/Blurbs";
import { Hero } from "@/sections/Hero";
import { Bridge } from "@/sections/Bridge";
import { Exchange } from "@/sections/Exchange";
import { ZeroBanner } from "@/sections/ZeroBanner";
import { Features } from "@/sections/Features";
import { ProductsTrio } from "@/sections/ProductsTrio";
import { CardSection } from "@/sections/CardSection";
import { TrustStrip } from "@/sections/TrustStrip";
import { Faq } from "@/sections/Faq";
import { Finale } from "@/sections/Finale";

export default function Home() {
  return (
    <>
      <Preloader />
      <Cursor />
      <Nav />
      <NavMotion />
      <main>
        <Hero />
        <TickerTape />
        <Blurbs />
        <MarketStrip />
        <Bridge />
        <Exchange />
        <ZeroBanner />
        <Features />
        <ProductsTrio />
        <CardSection />
        <TrustStrip />
        <Faq />
        <Finale />
      </main>
    </>
  );
}
