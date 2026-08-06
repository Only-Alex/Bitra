import { Magnetic } from "@/components/Magnetic";

const LINKS = ["Markets", "Exchange", "Features", "Card"];

export function Nav() {
  return (
    <header data-nav className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-[var(--nav-h)] max-w-[1720px] items-center justify-between px-6 md:px-10">
        <a
          href="#"
          className="display text-[20px] leading-none tracking-[-0.03em]"
        >
          BITRA<span className="text-ember">.</span>
        </a>

        <nav className="glass absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 rounded-full px-9 py-3.5 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="label text-mute transition-colors duration-300 hover:text-bone"
            >
              {l}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-7">
          <span className="label hidden items-center gap-2.5 text-mute md:flex">
            <span className="pulse-dot" />
            Markets open
          </span>
          <Magnetic strength={0.25}>
            <a
              href="#cta"
              className="label rounded-full bg-ember px-5.5 py-3 text-void transition-colors duration-300 hover:bg-ember-hi"
            >
              Launch app
            </a>
          </Magnetic>
        </div>
      </div>
    </header>
  );
}
