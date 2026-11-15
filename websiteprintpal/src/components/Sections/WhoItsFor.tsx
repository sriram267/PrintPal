import { IconInfo } from "../Hero/icons";
import { CncRouter, WideFormatPrinter } from "../Scene/Machines";
import { IconCheck } from "./moreIcons";
import { useInView } from "./useInView";
import { useReveal } from "./useReveal";
import "./sections.css";
import "./whoItsFor.css";

/* Product names are from the pre-loaded signage catalogue. Every point below is something the product does today. */

const CARDS = [
  {
    id: "sign",
    tone: "orange",
    title: "Sign shops & fabricators",
    lead: "Acrylic and LED letters, ACP boards, name boards, pylons and hoardings.",
    points: [
      "Price by square feet, per piece or as a lump sum",
      "Add installation and transport to every quote",
      "Keep each site and its services under one customer",
    ],
    products: ["ACP Board", "Front-Lit Channel Letters", "LED Neon Sign", "Name Board", "Pylon Sign"],
  },
  {
    id: "print",
    tone: "blue",
    title: "Large & wide-format printers",
    lead: "Flex banners, vinyl, window graphics, wall murals and standees.",
    points: [
      "Price by square foot or square metre, running feet or metres",
      "Give repeat customers any number of sites",
      "Send a GST-ready quotation PDF with your logo",
    ],
    products: ["Flex Banner", "Window Graphic", "Wall Mural / Wall Graphic", "Standee (Roll-up)", "SEG Fabric Lightbox"],
  },
] as const;

function Card({ card, delay }: { card: (typeof CARDS)[number]; delay: number }) {
  const [ref, seen] = useInView<HTMLElement>("0px 0px -8% 0px");
  return (
    <article className={`wf-card is-${card.tone} reveal`} ref={ref} style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      <div className="wf-art">{card.id === "sign" ? <CncRouter running={seen} /> : <WideFormatPrinter running={seen} />}</div>
      <div className="wf-body">
        <h3>{card.title}</h3>
        <p className="wf-lead">{card.lead}</p>
        <ul className="wf-points">
          {card.points.map((p) => (
            <li key={p}>
              <IconCheck size={15} strokeWidth={2.2} />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <div className="wf-products">
          {card.products.map((p) => (
            <span key={p}>{p}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function WhoItsFor() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="sx wf" id="who" ref={ref}>
      <div className="sx-inner">
        <span className="sx-chip reveal">Who it's for</span>
        <h2 className="sx-h2 reveal" style={{ "--d": "60ms" } as React.CSSProperties}>
          Made for shops that make and print signs. <span>Fabricators and large-format printers across India.</span>
        </h2>

        <div className="wf-grid">
          {CARDS.map((c, i) => (
            <Card key={c.id} card={c} delay={140 + i * 100} />
          ))}
        </div>

        <p className="wf-note reveal" style={{ "--d": "340ms" } as React.CSSProperties}>
          <IconInfo size={15} />
          PrintPal isn't built for offset or commercial printing.
        </p>
      </div>
    </section>
  );
}
