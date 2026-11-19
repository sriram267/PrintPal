import * as React from "react";
import { Calendar, Globe, MapPin } from "lucide-react";
import { CtaBand, Eyebrow, Logo, MiniCard, MiniField, Section, SectionHeading, SiteFooter, SiteNav, TabRail, WindowFrame } from "../../src/website/blocks";
import { Button } from "../../src/core/button";
import { Badge } from "../../src/core/badge";
import { Input } from "../../src/core/input";
import { Demo, Grid, type Entry } from "../kit";

export const website: Entry[] = [
  {
    id: "logo",
    name: "Logo",
    group: "Website",
    usedIn: ["Website", "App"],
    description: "The PrintPal logo: ink tile, white P, orange dot. A light version for dark backgrounds.",
    Demo: () => (
      <Grid cols={2}>
        <Demo>
          <Logo />
          <Logo markOnly size={32} />
        </Demo>
        <Demo dark>
          <Logo theme="light" />
        </Demo>
      </Grid>
    ),
    code: `<Logo />  <Logo theme="light" />  <Logo markOnly />`,
  },
  {
    id: "site-nav",
    name: "Site navigation",
    group: "Website",
    usedIn: ["Website"],
    description: "The website's top bar. On phones the links fold into a menu.",
    Demo: () => (
      <div className="overflow-hidden rounded-xl border border-line">
        <SiteNav
          sticky={false}
          links={[
            { label: "Product", href: "#product" },
            { label: "How it works", href: "#how" },
            { label: "FAQ", href: "#faq" },
          ]}
          actions={
            <>
              <Button variant="outline" size="md" className="rounded-lg text-base">
                Sign in
              </Button>
              <Button variant="dark" size="md" className="rounded-lg text-base">
                Join the waitlist
              </Button>
            </>
          }
        />
      </div>
    ),
    code: `<SiteNav links={LINKS} actions={<Button variant="dark">Join the waitlist</Button>} />`,
  },
  {
    id: "section",
    name: "Section & heading",
    group: "Website",
    usedIn: ["Website"],
    description: "A page section with the site's width and edge lines, and the two-tone heading (dark, then grey).",
    Demo: () => (
      <div className="overflow-hidden rounded-xl border border-line">
        <Section frame tone="white" className="py-12">
          <SectionHeading eyebrow="Product" title="Everything a sign shop needs to quote and bill," muted="in one place, from first enquiry to final invoice." />
        </Section>
      </div>
    ),
    code: `<Section frame>
  <SectionHeading eyebrow="Product" title="Everything a sign shop needs," muted="in one place." />
</Section>`,
  },
  {
    id: "eyebrow",
    name: "Eyebrow",
    group: "Website",
    usedIn: ["Website"],
    description: "The small blue label above a section heading.",
    Demo: () => (
      <Demo>
        <Eyebrow>Product</Eyebrow>
        <Eyebrow>How it works</Eyebrow>
        <Eyebrow>FAQ</Eyebrow>
      </Demo>
    ),
    code: `<Eyebrow>Product</Eyebrow>`,
  },
  {
    id: "tab-rail",
    name: "Tab rail",
    group: "Website",
    usedIn: ["Website"],
    description: "The big vertical list of steps beside the product showcase.",
    Demo: () => {
      const [a, setA] = React.useState("quotation");
      return (
        <Demo className="block">
          <TabRail
            active={a}
            onSelect={setA}
            items={[
              { id: "leads", label: "Leads" },
              { id: "quotation", label: "Quotation" },
              { id: "invoicing", label: "Invoicing" },
              { id: "catalogue", label: "Catalogue" },
            ]}
          />
        </Demo>
      );
    },
    code: `<TabRail items={STEPS} active={step} onSelect={setStep} />`,
  },
  {
    id: "window-mini",
    name: "Window & mini UI",
    group: "Website",
    usedIn: ["Website"],
    description: "A soft app window and small cards and fields, for redrawing app screens on the website.",
    Demo: () => (
      <Demo className="block bg-surface p-8">
        <WindowFrame title="PrintPal — Leads" className="mx-auto max-w-2xl">
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniCard label="Basic details">
              <div className="grid gap-2">
                <MiniField label="Business name" value="Meridian Interiors" />
                <MiniField label="Follow-up date" value="20 Nov, 2026" icon={<Calendar />} focused />
              </div>
            </MiniCard>
            <MiniCard label="Site details">
              <div className="flex items-center justify-between">
                <b>Indiranagar Showroom</b>
                <Badge tone="success" shape="pill">
                  2 services
                </Badge>
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-muted">
                <MapPin className="size-3" /> 100 Feet Rd, Bengaluru
              </div>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold text-accent shadow-[inset_0_0_0_1px_#E1E4E8]">
                <Globe className="size-3" /> 360° view
              </span>
            </MiniCard>
          </div>
        </WindowFrame>
      </Demo>
    ),
    code: `<WindowFrame title="PrintPal — Leads">
  <MiniCard label="Basic details"><MiniField label="Business name" value="Meridian Interiors" /></MiniCard>
</WindowFrame>`,
  },
  {
    id: "cta-band",
    name: "Call-to-action band",
    group: "Website",
    usedIn: ["Website"],
    description: "The dark closing panel with a warm glow, where people join the pilot.",
    Demo: () => (
      <Demo dark className="block p-4">
        <CtaBand tag="Free during the pilot" title="Quote your next sign job in minutes." subtitle="Join the sign shops already on the waitlist.">
          <div className="flex gap-2">
            <Input placeholder="you@yourshop.in" className="h-control-lg rounded-lg" />
            <Button size="lg" className="shrink-0">
              Join
            </Button>
          </div>
        </CtaBand>
      </Demo>
    ),
    code: `<CtaBand tag="Free during the pilot" title="Quote your next sign job in minutes.">
  <WaitlistForm />
</CtaBand>`,
  },
  {
    id: "site-footer",
    name: "Footer",
    group: "Website",
    usedIn: ["Website"],
    description: "The dark footer with the logo, link columns and a bottom line.",
    Demo: () => (
      <div className="overflow-hidden rounded-xl">
        <SiteFooter
          blurb="Quotes and bills for sign shops and wide-format printers."
          columns={[
            { title: "Product", links: [{ label: "Leads", href: "#" }, { label: "Quotation", href: "#" }, { label: "Catalogue", href: "#" }] },
            { title: "Company", links: [{ label: "Sign in", href: "#" }, { label: "Join the waitlist", href: "#" }] },
          ]}
          bottomLeft="© 2026 PrintPal"
          bottomRight="Made in India"
        />
      </div>
    ),
    code: `<SiteFooter blurb="…" columns={COLUMNS} bottomLeft="© 2026 PrintPal" />`,
  },
];
