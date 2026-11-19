import * as React from "react";
import { Menu, Search, X } from "lucide-react";
import { cn } from "../src/lib/cn";
import { Logo } from "../src/website/blocks";
import { Code, type Entry } from "./kit";
import { foundations } from "./demos/foundations";
import { core } from "./demos/core";
import { pal } from "./demos/pal";
import { product } from "./demos/product";
import { website } from "./demos/website";

const ENTRIES: Entry[] = [...foundations, ...core, ...pal, ...product, ...website];
const GROUPS: Entry["group"][] = ["Foundations", "Core", "Pal", "Product", "Website"];
const GROUP_NOTE: Record<Entry["group"], string> = {
  Foundations: "Colours, type, corners, shadows and motion. Every component is built from these.",
  Core: "The everyday building blocks: buttons, fields, lists, pop-ups.",
  Pal: "Our mascot, in every state.",
  Product: "Pieces made for the PrintPal app.",
  Website: "Pieces made for the marketing website.",
};

/** The preview page: every component on one scrolling page, with a left menu that jumps to each. */
export function App() {
  const [active, setActive] = React.useState(ENTRIES[0].id);
  const [query, setQuery] = React.useState("");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const lock = React.useRef(0);

  /* Highlight the section you are reading. */
  React.useEffect(() => {
    const els = ENTRIES.map((e) => document.getElementById(e.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (list) => {
        if (Date.now() < lock.current) return;
        const visible = list.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* Open at #component-id when the link is shared. */
  React.useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id && document.getElementById(id)) {
      setActive(id);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    }
  }, []);

  /* Keep the highlighted item visible in a long menu (scroll only the list, never the page or the panel). */
  React.useEffect(() => {
    document.querySelectorAll<HTMLElement>(`[data-nav="${active}"]`).forEach((item) => {
      const list = item.closest<HTMLElement>("[data-nav-list]");
      if (!list || !list.clientHeight) return;
      const top = item.offsetTop - list.offsetTop;
      if (top < list.scrollTop + 8) list.scrollTop = top - 8;
      else if (top + item.offsetHeight > list.scrollTop + list.clientHeight - 8) list.scrollTop = top + item.offsetHeight - list.clientHeight + 8;
    });
  }, [active]);

  const go = (id: string) => {
    lock.current = Date.now() + 900;
    setActive(id);
    setMenuOpen(false);
    history.replaceState(null, "", `#${id}`);
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  };

  const q = query.trim().toLowerCase();
  const match = (e: Entry) => !q || (e.name + " " + e.description).toLowerCase().includes(q);

  const nav = (
    <nav aria-label="Components" className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-5">
        <Logo />
        <div className="mt-1 pl-[34px] text-xs font-medium text-muted">UI library · {ENTRIES.length - foundations.length} components</div>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a component"
            aria-label="Find a component"
            className="h-9 w-full rounded-sm border border-line bg-white pl-8 pr-2 text-sm outline-none placeholder:text-faint focus:border-accent"
          />
        </div>
      </div>
      <div data-nav-list className="relative min-h-0 flex-1 overflow-y-auto px-3 pb-8">
        {GROUPS.map((g) => {
          const list = ENTRIES.filter((e) => e.group === g && match(e));
          if (!list.length) return null;
          return (
            <div key={g} className="mb-4">
              <div className="px-2.5 pb-1 text-2xs font-semibold uppercase tracking-wide text-muted">{g}</div>
              {list.map((e) => (
                <a
                  key={e.id}
                  href={`#${e.id}`}
                  data-nav={e.id}
                  onClick={(ev) => {
                    ev.preventDefault();
                    go(e.id);
                  }}
                  aria-current={active === e.id ? "true" : undefined}
                  className={cn(
                    "relative flex h-8 items-center rounded-sm px-2.5 text-sm transition-colors duration-fast",
                    active === e.id ? "bg-white font-medium text-ink shadow-[0_0_0_1px_rgb(var(--pp-border))]" : "text-ink-3 hover:bg-white/70 hover:text-ink",
                  )}
                >
                  {active === e.id && <span className="absolute -left-3 top-1.5 bottom-1.5 w-0.5 rounded-full bg-brand" />}
                  {e.name}
                </a>
              ))}
            </div>
          );
        })}
        {!ENTRIES.some(match) && <p className="px-2.5 text-sm text-muted">No component called “{query}”.</p>}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* Left menu */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-line bg-surface lg:block">{nav}</aside>

      {/* Phone / tablet: menu button + drawer */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
        <Logo size={22} />
        <button type="button" onClick={() => setMenuOpen(true)} className="flex h-9 items-center gap-2 rounded-sm border border-line bg-white px-3 text-sm font-medium">
          <Menu className="size-4" /> Components
        </button>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/30 animate-fade-in" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] bg-surface shadow-dialog animate-slide-up">
            <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="absolute right-3 top-4 z-10 grid size-8 place-items-center rounded-sm hover:bg-black/5">
              <X className="size-4" />
            </button>
            {nav}
          </div>
        </div>
      )}

      {/* Components */}
      <main className="lg:pl-[264px]">
        <div className="mx-auto max-w-[1080px] px-5 pb-32 pt-10 sm:px-10">
          <header className="mb-14">
            <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.03em]">PrintPal UI</h1>
            <p className="mt-2 max-w-[640px] text-md leading-relaxed text-ink-3">
              Every building block of the PrintPal app and website, in one place. New screens are built only from these, so
              everything stays consistent. Click a name on the left to jump to it.
            </p>
          </header>

          {GROUPS.map((g) => (
            <div key={g} className="mb-6">
              <div className="mb-8 border-b border-line pb-3">
                <h2 className="text-lg font-semibold">{g}</h2>
                <p className="mt-0.5 text-sm text-muted">{GROUP_NOTE[g]}</p>
              </div>
              {ENTRIES.filter((e) => e.group === g).map((e) => (
                <section key={e.id} id={e.id} className="mb-16 scroll-mt-20 lg:scroll-mt-8">
                  <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-xl font-semibold">{e.name}</h3>
                    {e.usedIn && (
                      <div className="flex flex-wrap gap-1.5">
                        {e.usedIn.map((u) => (
                          <span key={u} className="rounded-full bg-white px-2 py-0.5 text-2xs font-medium text-ink-3 shadow-[0_0_0_1px_rgb(var(--pp-border))]">
                            {u}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="-mt-3 mb-5 max-w-[720px] text-base text-ink-3">{e.description}</p>
                  <e.Demo />
                  {e.code && (
                    <div className="mt-5">
                      <Code code={e.code} />
                    </div>
                  )}
                </section>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
