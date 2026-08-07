import { BitraMark } from "@/components/BitraMark";

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-[var(--nav-h)] max-w-[1680px] items-center justify-between px-6 md:px-10">
        <a href="#" className="flex items-center gap-2.5">
          <BitraMark size={22} />
          <span className="display text-[19px] leading-none">
            BITRA<span className="text-ice">.</span>
          </span>
        </a>
        <nav className="glass hidden items-center gap-8 rounded-full px-8 py-3 md:flex">
          {["Exchange", "Markets", "Card"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="label text-mute transition-colors duration-300 hover:text-bone"
            >
              {l}
            </a>
          ))}
        </nav>
        <a
          href="#exchange"
          className="label rounded-full bg-ice px-5 py-3 text-void transition-colors duration-300 hover:bg-ice-hi"
        >
          Enter the exchange
        </a>
      </div>
    </header>
  );
}
