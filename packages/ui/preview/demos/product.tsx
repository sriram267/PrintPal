import * as React from "react";
import { Building2, FileText, Layers, Package, Receipt, Settings, Sparkles, Trash2, UserRound, Users } from "lucide-react";
import { NotchDocumentBar, NotchPill, NotchToast } from "../../src/product/notch";
import { EmptyState, PageHeader, SectionCard, SettingsNav, TopBar, UserPill } from "../../src/product/layout";
import { DateField, MonthCalendar } from "../../src/product/date-picker";
import { DatePicker } from "../../src/product/date-input";
import { Calendar } from "../../src/product/calendar-grid";
import { ImageUpload } from "../../src/product/image-upload";
import { Modal, ModalBody, ModalButton, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalIconBadge, ModalTitle } from "../../src/core/modal-system";
import { FileChip, FileDropzone } from "../../src/product/file-dropzone";
import { SearchSelect } from "../../src/product/search-select";
import { Sheet } from "../../src/product/sheet";
import { Button } from "../../src/core/button";
import { IconButton } from "../../src/core/icon-button";
import { Input } from "../../src/core/input";
import { Field, FieldRow } from "../../src/core/field";
import { Panel } from "../../src/core/card";
import { Badge } from "../../src/core/badge";
import { SegmentedControl } from "../../src/core/segmented-control";
import { PalMascot } from "../../src/pal/PalMascot";
import { Demo, Grid, type Entry } from "../kit";

export const product: Entry[] = [
  {
    id: "notch",
    name: "Pal notch",
    group: "Product",
    usedIn: ["App", "Website"],
    description: "The black notch at the top of the screen: idle pill, toasts (Pal tinted by the state), and the printer that quotations come out of.",
    Demo: () => (
      <Grid cols={1}>
        <Demo title="Idle" className="justify-center bg-surface">
          <NotchPill label="Quotations" />
        </Demo>
        <Demo title="Toasts" className="flex-col items-center gap-6 bg-surface">
          <NotchToast variant="success" title="Quote saved" description="Meridian Interiors · Q-001-V2" progress={0.6} onClose={() => {}} />
          <NotchToast variant="error" title="Couldn't save the quote" description="Check your connection and try again." onClose={() => {}} />
          <NotchToast variant="warning" title="Some prices are missing" />
          <NotchToast variant="info" title="Quote copied" />
        </Demo>
        <Demo title="Printer (a quote printing)" className="justify-center bg-surface">
          <NotchDocumentBar title="Quotation Q-001-V1" subtitle="Meridian Interiors · ₹55,093.14" paperWidth={460} onDownload={() => {}} onClose={() => {}} />
        </Demo>
      </Grid>
    ),
    code: `<NotchPill label="Quotations" docked />
<NotchToast variant="success" title="Quote saved" description="Q-001-V2" />
<NotchDocumentBar title="Quotation Q-001-V1" onDownload={download} onClose={close} />`,
  },
  {
    id: "top-bar",
    name: "Top bar",
    group: "Product",
    usedIn: ["App"],
    description: "The app's main navigation, with the signed-in person on the right.",
    Demo: () => {
      const [a, setA] = React.useState("leads");
      return (
        <div className="overflow-x-auto rounded-xl border border-line">
          <TopBar
            active={a}
            onNavigate={setA}
            items={[
              { id: "leads", label: "Leads", icon: <Users /> },
              { id: "quotation", label: "Quotation", icon: <FileText /> },
              { id: "reports", label: "Quotation Reports", icon: <Receipt /> },
              { id: "settings", label: "Settings", icon: <Settings /> },
            ]}
            right={<UserPill name="Ravi Kumar" />}
          />
        </div>
      );
    },
    code: `<TopBar items={NAV} active={page} onNavigate={setPage} right={<UserPill name={user.name} />} />`,
  },
  {
    id: "page-header",
    name: "Page header",
    group: "Product",
    usedIn: ["App"],
    description: "The title block at the top of every page, with that page's actions on the right.",
    Demo: () => {
      const [t, setT] = React.useState<"customer" | "enquiry">("customer");
      return (
        <Demo className="block bg-surface">
          <PageHeader
            title="Leads"
            subtitle="Everyone who has asked you for a quote"
            actions={
              <>
                <SegmentedControl value={t} onValueChange={setT} options={[{ value: "customer", label: "Customer" }, { value: "enquiry", label: "Enquiry" }]} />
                <Button className="sm:min-w-[164px]">Add new Customer</Button>
              </>
            }
          />
        </Demo>
      );
    },
    code: `<PageHeader title="Leads" subtitle="…" actions={<Button>Add new Customer</Button>} />`,
  },
  {
    id: "settings-nav",
    name: "Settings menu",
    group: "Product",
    usedIn: ["App"],
    description: "The grouped left menu on the Settings page.",
    Demo: () => {
      const [a, setA] = React.useState("materials");
      return (
        <div className="flex overflow-hidden rounded-xl border border-line bg-surface">
          <SettingsNav
            active={a}
            onNavigate={setA}
            groups={[
              { label: "Business", items: [{ id: "business", label: "Business Details", icon: <Building2 /> }] },
              {
                label: "Products & Finishes",
                items: [
                  { id: "products", label: "Products", icon: <Package /> },
                  { id: "materials", label: "Materials", icon: <Layers /> },
                  { id: "finishes", label: "Finishes", icon: <Sparkles /> },
                ],
              },
              { label: "Quotation & Taxes", items: [{ id: "tax", label: "Tax Setting", icon: <Receipt /> }] },
              { label: "Supplier & Vendors", items: [{ id: "supplier", label: "Supplier", icon: <UserRound /> }] },
            ]}
          />
          <div className="flex-1 p-6 text-sm text-muted">The chosen settings page shows here.</div>
        </div>
      );
    },
    code: `<SettingsNav groups={GROUPS} active={page} onNavigate={setPage} />`,
  },
  {
    id: "empty-state",
    name: "Empty state",
    group: "Product",
    usedIn: ["App"],
    description: "What a list shows before it has anything: what goes here, and a button to add the first one.",
    Demo: () => (
      <Demo className="justify-center bg-surface py-10">
        <EmptyState
          art={<PalMascot size={72} />}
          title="No customers yet"
          description="Add your first customer to start quoting. Their sites and GST details are saved for every quote."
          action={<Button>Add new Customer</Button>}
        />
      </Demo>
    ),
    code: `<EmptyState art={<PalMascot size={72} />} title="No customers yet" action={<Button>Add</Button>} />`,
  },
  {
    id: "section-card",
    name: "Section card",
    group: "Product",
    usedIn: ["App"],
    description: "A card with a grey header bar that opens and closes — one per site, service or address.",
    Demo: () => (
      <Demo className="block bg-surface">
        <SectionCard
          title="Site 1 · Indiranagar Showroom"
          meta={<Badge tone="success" shape="pill">2 services</Badge>}
          tools={
            <IconButton label="Delete site" size="sm">
              <Trash2 />
            </IconButton>
          }
        >
          <FieldRow cols={2}>
            <Field label="Site name">
              <Input defaultValue="Indiranagar Showroom" />
            </Field>
            <Field label="Address">
              <Input defaultValue="100 Feet Rd, Indiranagar, Bengaluru" />
            </Field>
          </FieldRow>
        </SectionCard>
      </Demo>
    ),
    code: `<SectionCard title="Site 1 · Indiranagar Showroom" tools={<IconButton label="Delete">…</IconButton>}>
  …fields
</SectionCard>`,
  },
  {
    id: "date-field",
    name: "Date field",
    group: "Product",
    usedIn: ["App"],
    description: "A field that opens a calendar, for new screens. Arrow keys move between days. Shows a month grid (Month calendar) in a pop-up.",
    Demo: () => {
      const [d, setD] = React.useState<Date | undefined>(new Date(2026, 10, 20));
      return (
        <Demo>
          <div className="w-60">
            <Field label="Follow-up date">
              <DateField value={d} onChange={setD} />
            </Field>
          </div>
          <div className="w-60">
            <Field label="Quote date">
              <DateField onChange={() => {}} />
            </Field>
          </div>
        </Demo>
      );
    },
    code: `<Field label="Follow-up date"><DateField value={date} onChange={setDate} /></Field>`,
  },
  {
    id: "month-calendar",
    name: "Month calendar",
    group: "Product",
    usedIn: ["App"],
    description: "The month grid on its own, for new screens.",
    Demo: () => (
      <Demo>
        <div className="rounded-xl border border-line bg-white p-3">
          <MonthCalendar onChange={() => {}} />
        </div>
      </Demo>
    ),
    code: `<MonthCalendar value={date} onChange={setDate} />`,
  },
  {
    id: "date-picker",
    name: "Date picker (current app)",
    group: "Product",
    usedIn: ["App"],
    description: "The date field the app uses today: a field that opens a month calendar.",
    Demo: () => {
      const [d, setD] = React.useState<Date | undefined>(new Date(2026, 10, 20));
      return (
        <Demo>
          <div className="w-60">
            <DatePicker date={d} onDateChange={(x) => setD(x)} />
          </div>
          <div className="rounded-xl border border-line bg-white p-3">
            <Calendar mode="single" selected={d} onSelect={setD} />
          </div>
        </Demo>
      );
    },
    code: `<DatePicker date={date} onDateChange={(d) => setDate(d)} />
<Calendar mode="single" selected={date} onSelect={setDate} />`,
  },
  {
    id: "image-upload",
    name: "Image upload",
    group: "Product",
    usedIn: ["App"],
    description: "An upload area with a grid of thumbnails, for logos, photos and documents.",
    Demo: () => (
      <Demo>
        <div className="w-full max-w-md">
          <ImageUpload title="Business logo" helperText="PNG or JPG, up to 2 MB" maxFiles={3} />
        </div>
      </Demo>
    ),
    code: `<ImageUpload title="Business logo" maxFiles={3} onChange={setImages} />`,
  },
  {
    id: "modal-system",
    name: "Modal",
    group: "Product",
    usedIn: ["App"],
    description: "The app's pop-up: an icon, a title, a short line, the form, and the buttons.",
    Demo: () => {
      const [open, setOpen] = React.useState(false);
      return (
        <Demo>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Open a modal
          </Button>
          <Modal open={open} onOpenChange={setOpen}>
            <ModalContent size="md">
              <ModalHeader>
                <ModalIconBadge variant="brand" shape="square" className="mb-3">
                  +
                </ModalIconBadge>
                <ModalTitle>Add Tax</ModalTitle>
                <ModalDescription>Taxes show up on every quotation.</ModalDescription>
              </ModalHeader>
              <ModalBody>
                <Field label="Tax name">
                  <Input placeholder="GST 18%" />
                </Field>
              </ModalBody>
              <ModalFooter>
                <ModalButton variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </ModalButton>
                <ModalButton onClick={() => setOpen(false)}>Save</ModalButton>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Demo>
      );
    },
    code: `<Modal open={open} onOpenChange={setOpen}>
  <ModalContent size="md"><ModalHeader>…</ModalHeader><ModalBody>…</ModalBody><ModalFooter>…</ModalFooter></ModalContent>
</Modal>`,
  },  {
    id: "search-select",
    name: "Search select",
    group: "Product",
    usedIn: ["App"],
    description: "Pick from a long list by typing; can add a new one without leaving the form.",
    Demo: () => {
      const [v, setV] = React.useState<string | undefined>("p2");
      const [opts, setOpts] = React.useState<{ value: string; label: string; detail?: string }[]>([
        { value: "p1", label: "Flex Banner", detail: "Solvent printing · per sq ft" },
        { value: "p2", label: "ACP Board", detail: "Fabrication · per sq ft" },
        { value: "p3", label: "Front-Lit Channel Letters", detail: "Fabrication · per piece" },
        { value: "p4", label: "Window Graphic", detail: "Vinyl · per sq ft" },
      ]);
      return (
        <Demo>
          <div className="w-72">
            <Field label="Product">
              <SearchSelect
                options={opts}
                value={v}
                onValueChange={setV}
                searchPlaceholder="Search products"
                addLabel="Add product"
                onAdd={(name) => {
                  const id = `p${opts.length + 1}`;
                  setOpts((o) => [...o, { value: id, label: name || "New product" }]);
                  setV(id);
                }}
              />
            </Field>
          </div>
        </Demo>
      );
    },
    code: `<SearchSelect options={products} value={id} onValueChange={setId}
  addLabel="Add product" onAdd={(name) => openQuickAdd(name)} />`,
  },
  {
    id: "file-dropzone",
    name: "File dropzone",
    group: "Product",
    usedIn: ["App"],
    description: "Drop files or click to pick them — logos, artwork, site photos.",
    Demo: () => {
      const [files, setFiles] = React.useState(["shop-front.jpg", "logo-final.pdf"]);
      return (
        <Demo className="flex-col items-stretch">
          <FileDropzone hint="PNG, JPG or PDF, up to 10 MB" onFiles={(f) => setFiles((l) => [...l, ...f.map((x) => x.name)])} />
          <div className="flex flex-wrap gap-1.5">
            {files.map((f) => (
              <FileChip key={f} name={f} onRemove={() => setFiles((l) => l.filter((x) => x !== f))} />
            ))}
          </div>
        </Demo>
      );
    },
    code: `<FileDropzone accept="image/*,.pdf" onFiles={addFiles} />
<FileChip name="logo.pdf" onRemove={() => remove("logo.pdf")} />`,
  },
  {
    id: "sheet",
    name: "Sheet",
    group: "Product",
    usedIn: ["App"],
    description: "A big panel that slides up for long forms (New customer, New supplier). The top bar stays visible above it.",
    Demo: () => {
      const [open, setOpen] = React.useState(false);
      return (
        <Demo>
          <Button onClick={() => setOpen(true)}>Open “New customer”</Button>
          <Sheet
            open={open}
            onOpenChange={setOpen}
            title="New customer"
            actions={
              <>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpen(false)}>Save customer</Button>
              </>
            }
          >
            <div className="mx-auto flex max-w-5xl gap-5">
              <Panel className="w-[300px] shrink-0">
                <div className="mb-4 text-base font-semibold">Basic details</div>
                <div className="space-y-4">
                  <Field label="Business name" required>
                    <Input />
                  </Field>
                  <Field label="Phone">
                    <Input />
                  </Field>
                </div>
              </Panel>
              <Panel className="flex-1 text-sm text-muted">Sites, billing and shipping go here.</Panel>
            </div>
          </Sheet>
        </Demo>
      );
    },
    code: `<Sheet open={open} onOpenChange={setOpen} title="New customer"
  actions={<><Button variant="outline">Cancel</Button><Button>Save</Button></>}>
  …
</Sheet>`,
  },
];
