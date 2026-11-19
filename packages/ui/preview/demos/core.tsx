import * as React from "react";
import { Copy, Download, MoreHorizontal, Pencil, Phone, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "../../src/core/button";
import { IconButton } from "../../src/core/icon-button";
import { Spinner } from "../../src/core/spinner";
import { Input } from "../../src/core/input";
import { Textarea } from "../../src/core/textarea";
import { Field, FieldRow, Label } from "../../src/core/field";
import { Select } from "../../src/core/select";
import { Checkbox } from "../../src/core/checkbox";
import { RadioGroup } from "../../src/core/radio-group";
import { Switch } from "../../src/core/switch";
import { Badge, Chip, StatusBadge, Tag } from "../../src/core/badge";
import { Card, CardFooter, CardHeader } from "../../src/core/card";
import { SegmentedControl } from "../../src/core/segmented-control";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../src/core/tabs";
import { Tooltip } from "../../src/core/tooltip";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../../src/core/popover";
import { ConfirmDialog, Dialog, DialogClose, DialogContent, DialogTrigger } from "../../src/core/dialog";
import { DropdownMenu } from "../../src/core/dropdown-menu";
import { DataTable } from "../../src/core/table";
import { Avatar, Kbd, Separator, Skeleton } from "../../src/core/misc";
import { Accordion } from "../../src/core/accordion";
import { Demo, Grid, type Entry } from "../kit";

const CITIES = [
  { value: "blr", label: "Bengaluru" },
  { value: "che", label: "Chennai" },
  { value: "hyd", label: "Hyderabad" },
  { value: "mum", label: "Mumbai" },
];

export const core: Entry[] = [
  {
    id: "button",
    name: "Button",
    group: "Core",
    usedIn: ["App", "Website"],
    description: "Every clickable action. Use one orange (primary) button per screen for the main thing people came to do.",
    Demo: () => (
      <Grid cols={1}>
        <Demo title="Variants">
          <Button>Save customer</Button>
          <Button variant="secondary">Create quotation</Button>
          <Button variant="dark">Join the waitlist</Button>
          <Button variant="outline">Cancel</Button>
          <Button variant="ghost">
            <Plus /> Add another site
          </Button>
          <Button variant="danger">Delete</Button>
          <Button variant="link">View all quotes</Button>
        </Demo>
        <Grid cols={2}>
          <Demo title="Sizes">
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" variant="outline" aria-label="Download">
              <Download />
            </Button>
          </Demo>
          <Demo title="States">
            <Button loading>Saving…</Button>
            <Button disabled>Disabled</Button>
            <Button variant="outline" shape="pill">
              Pill shape
            </Button>
          </Demo>
        </Grid>
      </Grid>
    ),
    code: `<Button>Save customer</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary" size="sm"><Plus /> Add site</Button>
<Button loading>Saving…</Button>`,
  },
  {
    id: "icon-button",
    name: "Icon button",
    group: "Core",
    usedIn: ["App"],
    description: "A square button with only an icon — edit and delete in table rows, close in panels. Always give it a label for screen readers.",
    Demo: () => (
      <Demo>
        <IconButton tone="edit" label="Edit customer">
          <Pencil />
        </IconButton>
        <IconButton tone="delete" label="Delete customer">
          <Trash2 />
        </IconButton>
        <IconButton tone="boxed" label="Copy">
          <Copy />
        </IconButton>
        <IconButton label="Close">
          <X />
        </IconButton>
        <IconButton label="More" size="sm">
          <MoreHorizontal />
        </IconButton>
      </Demo>
    ),
    code: `<IconButton tone="edit" label="Edit customer"><Pencil /></IconButton>
<IconButton tone="delete" label="Delete customer"><Trash2 /></IconButton>`,
  },
  {
    id: "input",
    name: "Input",
    group: "Core",
    usedIn: ["App"],
    description: "A one-line text field. Grey border, blue when you type, red when something is wrong.",
    Demo: () => (
      <Grid cols={2}>
        <Demo title="Default, with icon" className="flex-col items-stretch">
          <Input placeholder="Business name" />
          <Input icon={<Search />} placeholder="Search customers" />
          <Input icon={<Phone />} defaultValue="98765 43210" />
        </Demo>
        <Demo title="Invalid, disabled" className="flex-col items-stretch">
          <Input invalid defaultValue="98765" />
          <Input disabled defaultValue="Can't edit this" />
        </Demo>
      </Grid>
    ),
    code: `<Input placeholder="Business name" />
<Input icon={<Search />} placeholder="Search customers" />`,
  },
  {
    id: "textarea",
    name: "Textarea",
    group: "Core",
    usedIn: ["App"],
    description: "Text over several lines: notes, terms, addresses. Same look as Input; can be made taller by dragging.",
    Demo: () => (
      <Demo className="flex-col items-stretch">
        <Textarea placeholder="Notes for the workshop" />
      </Demo>
    ),
    code: `<Textarea rows={3} placeholder="Notes for the workshop" />`,
  },
  {
    id: "field",
    name: "Field & field row",
    group: "Core",
    usedIn: ["App"],
    description: "Wraps any control with its label, a hint, or an error message — and connects them for screen readers. FieldRow puts 2 or 3 side by side. Label alone is for custom layouts.",
    Demo: () => (
      <Demo className="block">
        <Label htmlFor="lbl-demo">Label on its own</Label>
        <Input id="lbl-demo" placeholder="For layouts Field doesn't cover" className="mb-6 max-w-sm" />
        <FieldRow cols={2}>
          <Field label="Contact person" required>
            <Input defaultValue="Ravi Kumar" />
          </Field>
          <Field label="Phone" error="Enter a 10-digit mobile number">
            <Input defaultValue="98765" />
          </Field>
          <Field label="GSTIN" hint="15 characters, printed on your quotes">
            <Input placeholder="29ABCDE1234F1Z5" />
          </Field>
          <Field label="City">
            <Select options={CITIES} placeholder="Pick a city" />
          </Field>
        </FieldRow>
      </Demo>
    ),
    code: `<FieldRow cols={2}>
  <Field label="Contact person" required><Input /></Field>
  <Field label="Phone" error="Enter a 10-digit mobile number"><Input /></Field>
</FieldRow>`,
  },
  {
    id: "select",
    name: "Select",
    group: "Core",
    usedIn: ["App"],
    description: "Pick one option from a short list. For long lists or ones you type into, use Search select.",
    Demo: () => {
      const [v, setV] = React.useState("che");
      return (
        <Demo>
          <div className="w-60">
            <Select options={CITIES} value={v} onValueChange={setV} />
          </div>
          <div className="w-60">
            <Select options={CITIES} placeholder="Payment terms" invalid />
          </div>
        </Demo>
      );
    },
    code: `<Select options={[{ value: "che", label: "Chennai" }]} value={city} onValueChange={setCity} />`,
  },
  {
    id: "checkbox",
    name: "Checkbox",
    group: "Core",
    usedIn: ["App"],
    description: "Tick one or more. Blue when ticked. Can show “some selected” for a select-all box.",
    Demo: () => {
      const [a, setA] = React.useState(true);
      return (
        <Demo>
          <Checkbox label="Billing address is the same as the site" checked={a} onCheckedChange={(c) => setA(c === true)} />
          <Checkbox label="Some selected" checked="indeterminate" />
          <Checkbox label="Disabled" disabled />
        </Demo>
      );
    },
    code: `<Checkbox label="Same as site address" checked={same} onCheckedChange={(c) => setSame(c === true)} />`,
  },
  {
    id: "radio-group",
    name: "Radio group",
    group: "Core",
    description: "Pick exactly one, with every option visible.",
    Demo: () => (
      <Demo>
        <RadioGroup
          defaultValue="sqft"
          options={[
            { value: "sqft", label: "Square feet", hint: "Flex, vinyl, ACP" },
            { value: "piece", label: "Per piece", hint: "Letters, standees" },
            { value: "lump", label: "Lump sum" },
          ]}
        />
      </Demo>
    ),
    code: `<RadioGroup defaultValue="sqft" options={[{ value: "sqft", label: "Square feet" }]} />`,
  },
  {
    id: "switch",
    name: "Switch",
    group: "Core",
    usedIn: ["App"],
    description: "Turn a setting on or off; it applies straight away, no Save needed.",
    Demo: () => (
      <Demo className="block max-w-md">
        <Switch label="Show suppliers" hint="Adds the Supplier tab to Leads" defaultChecked />
      </Demo>
    ),
    code: `<Switch label="Show suppliers" checked={on} onCheckedChange={setOn} />`,
  },
  {
    id: "badge",
    name: "Badge & status",
    group: "Core",
    usedIn: ["App", "Website"],
    description: "Small coloured labels for a state or a count. Quotation statuses have fixed colours.",
    Demo: () => (
      <Grid cols={2}>
        <Demo title="Quotation status">
          <StatusBadge status="open" />
          <StatusBadge status="renegotiated" />
          <StatusBadge status="invoice" />
        </Demo>
        <Demo title="Tones">
          <Badge tone="success">Saved</Badge>
          <Badge tone="warning">Needs follow-up</Badge>
          <Badge tone="danger">Overdue</Badge>
          <Badge tone="accent" shape="pill">
            Print
          </Badge>
          <Badge tone="brand" shape="pill">
            Fabrication
          </Badge>
          <Badge tone="success" shape="pill">
            2 services
          </Badge>
        </Demo>
      </Grid>
    ),
    code: `<StatusBadge status="invoice" />
<Badge tone="warning">Needs follow-up</Badge>
<Badge tone="success" shape="pill">2 services</Badge>`,
  },
  {
    id: "tag-chip",
    name: "Tag & chip",
    group: "Core",
    usedIn: ["App"],
    description: "Tags name a category; chips show a chosen value and can be removed.",
    Demo: () => {
      const [chips, setChips] = React.useState(["Matte lamination", "Powder coating", "Chennai"]);
      return (
        <Demo>
          <Tag>Solvent printing</Tag>
          <Tag>Outdoor</Tag>
          {chips.map((c) => (
            <Chip key={c} onRemove={() => setChips((l) => l.filter((x) => x !== c))}>
              {c}
            </Chip>
          ))}
        </Demo>
      );
    },
    code: `<Tag>Solvent printing</Tag>
<Chip onRemove={() => remove(id)}>Matte lamination</Chip>`,
  },
  {
    id: "card",
    name: "Card",
    group: "Core",
    usedIn: ["App", "Website"],
    description: "A white panel that groups things. Plain in the app, raised for empty states, soft for website pictures.",
    Demo: () => (
      <Demo className="items-start bg-surface" stage="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader title="Basic details" description="Who you're quoting" />
          <p className="text-sm text-ink-3">Plain: the app's standard card.</p>
        </Card>
        <Card variant="raised">
          <CardHeader title="Raised" />
          <p className="text-sm text-ink-3">For things that float a little.</p>
        </Card>
        <Card variant="soft">
          <CardHeader title="Soft" />
          <p className="text-sm text-ink-3">Website mock screens.</p>
          <CardFooter>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
            <Button size="sm">Save</Button>
          </CardFooter>
        </Card>
      </Demo>
    ),
    code: `<Card>
  <CardHeader title="Basic details" actions={<Button size="sm">Edit</Button>} />
  …
</Card>`,
  },
  {
    id: "segmented-control",
    name: "Segmented control",
    group: "Core",
    usedIn: ["App", "Website"],
    description: "Switch between two to four views of the same list. Arrow keys move between options.",
    Demo: () => {
      const [a, setA] = React.useState<"customer" | "enquiry">("customer");
      const [b, setB] = React.useState<"shops" | "printers">("shops");
      return (
        <Demo>
          <SegmentedControl aria-label="List" value={a} onValueChange={setA} options={[{ value: "customer", label: "Customer" }, { value: "enquiry", label: "Enquiry" }]} />
          <SegmentedControl aria-label="Audience" variant="pill" value={b} onValueChange={setB} options={[{ value: "shops", label: "Sign shops" }, { value: "printers", label: "Printers" }]} />
        </Demo>
      );
    },
    code: `<SegmentedControl value={tab} onValueChange={setTab}
  options={[{ value: "customer", label: "Customer" }, { value: "enquiry", label: "Enquiry" }]} />`,
  },
  {
    id: "tabs",
    name: "Tabs",
    group: "Core",
    usedIn: ["App"],
    description: "Sections of one page, one shown at a time.",
    Demo: () => (
      <Demo className="block">
        <Tabs defaultValue="sites">
          <TabsList>
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="billing">Billing & shipping</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
          <TabsContent value="sites" className="text-sm text-ink-3">2 sites · Indiranagar Showroom, Koramangala Studio</TabsContent>
          <TabsContent value="billing" className="text-sm text-ink-3">Billing address and payment terms.</TabsContent>
          <TabsContent value="files" className="text-sm text-ink-3">Artwork and site photos.</TabsContent>
        </Tabs>
      </Demo>
    ),
    code: `<Tabs defaultValue="sites">
  <TabsList><TabsTrigger value="sites">Sites</TabsTrigger>…</TabsList>
  <TabsContent value="sites">…</TabsContent>
</Tabs>`,
  },
  {
    id: "tooltip",
    name: "Tooltip",
    group: "Core",
    description: "A short dark hint on hover or keyboard focus. Never hide anything important in one.",
    Demo: () => (
      <Demo>
        <Tooltip content="Opens 360° street view">
          <Button variant="outline">Hover me</Button>
        </Tooltip>
        <Tooltip content="Delete" side="right">
          <IconButton tone="delete" label="Delete">
            <Trash2 />
          </IconButton>
        </Tooltip>
      </Demo>
    ),
    code: `<Tooltip content="Opens 360° street view"><Button>…</Button></Tooltip>`,
  },
  {
    id: "popover",
    name: "Popover",
    group: "Core",
    description: "A small panel attached to a button, for quick choices that don't need a whole dialog.",
    Demo: () => (
      <Demo>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Quick filters</Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-3">
            <div className="text-sm font-semibold">Show</div>
            <Checkbox label="Needs follow-up" defaultChecked />
            <Checkbox label="Has a quote" />
            <PopoverClose asChild>
              <Button size="sm" className="w-full">
                Apply
              </Button>
            </PopoverClose>
          </PopoverContent>
        </Popover>
      </Demo>
    ),
    code: `<Popover>
  <PopoverTrigger asChild><Button variant="outline">Filters</Button></PopoverTrigger>
  <PopoverContent>…</PopoverContent>
</Popover>`,
  },
  {
    id: "dialog",
    name: "Dialog & confirm",
    group: "Core",
    usedIn: ["App"],
    description: "A centred pop-up for one decision. ConfirmDialog is ready-made for deletes.",
    Demo: () => {
      const [open, setOpen] = React.useState(false);
      return (
        <Demo>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent
              title="Add a tax"
              description="It will be offered on every new quote."
              footer={
                <>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button>Add tax</Button>
                  </DialogClose>
                </>
              }
            >
              <FieldRow cols={2}>
                <Field label="Name">
                  <Input defaultValue="GST" />
                </Field>
                <Field label="Rate (%)">
                  <Input defaultValue="18" />
                </Field>
              </FieldRow>
            </DialogContent>
          </Dialog>
          <Button variant="danger" onClick={() => setOpen(true)}>
            Delete customer…
          </Button>
          <ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            title="Delete Meridian Interiors?"
            description="Their 2 sites and 3 quotations will be deleted too. This can't be undone."
            onConfirm={() => new Promise((r) => setTimeout(r, 700))}
          />
        </Demo>
      );
    },
    code: `<ConfirmDialog open={open} onOpenChange={setOpen}
  title="Delete Meridian Interiors?" description="This can't be undone."
  onConfirm={deleteCustomer} />`,
  },
  {
    id: "dropdown-menu",
    name: "Dropdown menu",
    group: "Core",
    description: "A short list of actions behind a button, like the ⋯ menu on a row.",
    Demo: () => (
      <Demo>
        <DropdownMenu
          label="Quotation"
          trigger={
            <Button variant="outline" size="icon" aria-label="More actions">
              <MoreHorizontal />
            </Button>
          }
          items={[
            { label: "Edit", icon: <Pencil /> },
            { label: "Duplicate", icon: <Copy /> },
            { label: "Download PDF", icon: <Download /> },
            { label: "Delete", icon: <Trash2 />, danger: true, separatorBefore: true },
          ]}
        />
      </Demo>
    ),
    code: `<DropdownMenu trigger={<IconButton label="More"><MoreHorizontal /></IconButton>}
  items={[{ label: "Edit", onSelect: edit }, { label: "Delete", danger: true, onSelect: remove }]} />`,
  },
  {
    id: "data-table",
    name: "Data table",
    group: "Core",
    usedIn: ["App"],
    description: "The app's lists: a grey header, tall rows that line up, actions on the right.",
    Demo: () => {
      const rows = [
        { id: "1", name: "Meridian Interiors", phone: "98765 43210", city: "Bengaluru", status: "invoice" as const },
        { id: "2", name: "Kavya Retail", phone: "98401 22345", city: "Chennai", status: "open" as const },
        { id: "3", name: "Lakshmi Textiles", phone: "99620 11876", city: "Coimbatore", status: "renegotiated" as const },
      ];
      return (
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          columns={[
            {
              header: "Customer",
              width: "2fr",
              cell: (r) => (
                <span className="flex items-center gap-2.5">
                  <Avatar name={r.name} size={26} />
                  <span className="truncate font-medium">{r.name}</span>
                </span>
              ),
            },
            { header: "Phone", cell: (r) => r.phone },
            { header: "City", cell: (r) => r.city },
            { header: "Latest quote", cell: (r) => <StatusBadge status={r.status} /> },
            {
              header: "Actions",
              width: "96px",
              align: "right",
              cell: (r) => (
                <span className="flex gap-1.5">
                  <IconButton tone="edit" label={`Edit ${r.name}`}>
                    <Pencil />
                  </IconButton>
                  <IconButton tone="delete" label={`Delete ${r.name}`}>
                    <Trash2 />
                  </IconButton>
                </span>
              ),
            },
          ]}
        />
      );
    },
    code: `<DataTable rows={customers} rowKey={(c) => c.id} columns={[
  { header: "Customer", width: "2fr", cell: (c) => c.name },
  { header: "Actions", width: "96px", align: "right", cell: (c) => <RowActions c={c} /> },
]} />`,
  },
  {
    id: "accordion",
    name: "Accordion",
    group: "Core",
    usedIn: ["Website"],
    description: "Questions or sections that open one at a time.",
    Demo: () => (
      <Demo className="block">
        <Accordion
          defaultOpen={["a"]}
          items={[
            { id: "a", title: "Is PrintPal free?", content: "Free during the pilot." },
            { id: "b", title: "Does it work on a phone?", content: "It runs in your browser, on a laptop or desktop screen." },
            { id: "c", title: "Can I change the catalogue?", content: "Yes — add, edit or remove any product, material or finish." },
          ]}
        />
      </Demo>
    ),
    code: `<Accordion items={[{ id: "a", title: "Is PrintPal free?", content: "Free during the pilot." }]} />`,
  },
  {
    id: "avatar-misc",
    name: "Avatar, separator, skeleton, key",
    group: "Core",
    description: "Small helpers: a person's initials, a dividing line, a loading placeholder, a keyboard key.",
    Demo: () => (
      <Grid cols={2}>
        <Demo title="Avatar · Kbd">
          <Avatar name="Ravi Kumar" />
          <Avatar name="Kavya Retail" size={36} />
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-ink-3">
            Press <Kbd>Esc</Kbd> to close
          </span>
          <Spinner className="text-accent" />
        </Demo>
        <Demo title="Skeleton (loading)" className="flex-col items-stretch">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </Demo>
      </Grid>
    ),
    code: `<Avatar name="Ravi Kumar" />
<Skeleton className="h-4 w-1/2" />
<Kbd>Esc</Kbd>`,
  },
];
