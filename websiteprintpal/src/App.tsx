import { Nav } from "./components/Nav/Nav";
import { PalNotch } from "./components/PalNotch/PalNotch";
import { HeroScene } from "./components/Scene/HeroScene";
import { Contrast } from "./components/Sections/Contrast";
import { HowItWorks } from "./components/Sections/HowItWorks";
import { Product } from "./components/Sections/Product";
import { WhoItsFor } from "./components/Sections/WhoItsFor";
import { Different } from "./components/Sections/Different";
import { Faq } from "./components/Sections/Faq";
import { FinalCta } from "./components/Sections/FinalCta";
import { Footer } from "./components/Footer/Footer";
import { WaitlistDialog } from "./components/WaitlistDialog";
import "./components/Sections/darkBlock.css";

/* Rhythm, the way Attio does it (see its page): a long LIGHT stretch whose variety comes from layout and
   texture, then ONE continuous DARK block for the big idea, then light again, then a short dark close.

   hero (light) → How it works → Product → Who it's for          [light stretch, off-white / white / dotted]
   → Without/With + How is PrintPal different?                   [one dark block with a glowing arc]
   → FAQ (light) → Final CTA + footer (dark) */
export function App() {
  return (
    <>
      <PalNotch label="Pilot open" />
      <Nav />
      <main>
        <HeroScene />
        <HowItWorks />
        <Product />
        <WhoItsFor />
        <div className="dk">
          <div className="dk-arc" aria-hidden="true" />
          <Contrast />
          <Different />
        </div>
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <WaitlistDialog />
    </>
  );
}
