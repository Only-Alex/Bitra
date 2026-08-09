import { Nav } from "@/components/Nav";
import { BitraLogo } from "@/components/BitraMark";
import { Experience } from "@/sections/Experience";
import { ExchangePreview } from "@/sections/ExchangePreview";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Experience />
        <ExchangePreview />
      </main>
      <footer className="px-6 pb-10 md:px-10">
        <div className="hairline h-px" />
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 pt-8">
          <BitraLogo height={20} className="opacity-80" />
          <p className="label text-faint">
            © 2026 Bitra · Products and availability may vary by jurisdiction
          </p>
        </div>
      </footer>
    </>
  );
}
