import { Nav } from "@/components/Nav";
import { Hero } from "@/sections/Hero";
import { ExchangePreview } from "@/sections/ExchangePreview";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ExchangePreview />
      </main>
      <footer className="px-6 pb-10 md:px-10">
        <div className="hairline h-px" />
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 pt-8">
          <span className="display text-[16px]">
            BITRA<span className="text-ice">.</span>
          </span>
          <p className="label text-faint">
            © 2026 Bitra · Products and availability may vary by jurisdiction
          </p>
        </div>
      </footer>
    </>
  );
}
