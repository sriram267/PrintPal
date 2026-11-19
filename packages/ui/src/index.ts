/*
 * @printpal/ui — the one place PrintPal screens get their building blocks from.
 * Import the styles once:  import "@printpal/ui/src/styles/index.css";
 */

export { cn } from "./lib/cn";

/* Core */
export { Button, buttonVariants, type ButtonProps } from "./core/button";
export { IconButton, type IconButtonProps } from "./core/icon-button";
export { Spinner } from "./core/spinner";
export { Input, fieldBase, type InputProps } from "./core/input";
export { Textarea, type TextareaProps } from "./core/textarea";
export { Field, FieldRow, Label, type FieldProps } from "./core/field";
export { SelectField, type SelectOption, type SelectProps } from "./core/select";
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator } from "./core/select-menu";
export { BadgeGroup, BadgeGroupLabel, BadgeGroupCounter } from "./core/badge-group";
export { Checkbox, checkboxVariants, type CheckboxProps } from "./core/checkbox";
export { RadioGroup, type RadioOption } from "./core/radio-group";
export { Switch } from "./core/switch";
export { Badge, StatusBadge, Tag, Chip, type QuoteStatus } from "./core/badge";
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Panel, PanelHeader, PanelFooter, type PanelProps } from "./core/card";
export { SegmentedControl, type SegmentedOption } from "./core/segmented-control";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./core/tabs";
export { Tooltip } from "./core/tooltip";
export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent, PopoverClose } from "./core/popover";
export { Dialog, DialogTrigger, DialogClose, DialogContent, ConfirmDialog } from "./core/dialog";
export { DropdownMenu, type MenuItem } from "./core/dropdown-menu";
export { DataTable, type Column } from "./core/table";
export { Avatar, Separator, Skeleton, Kbd } from "./core/misc";
export { Accordion, type AccordionItemData } from "./core/accordion";

/* Pal */
export { PalMascot, type PalTone } from "./pal/PalMascot";
export { PalGreeting } from "./pal/PalGreeting";

/* Product */
export { NotchShell, NotchPill, NotchToast, NotchDocumentBar, type NotchToastVariant } from "./product/notch";
export { PageHeader, TopBar, UserPill, SettingsNav, EmptyState, SectionCard, type NavItem, type SettingsNavGroup } from "./product/layout";
export {
  PalNotch,
  palNotch,
  DOC_RIM,
  DOC_TOP,
  DOC_PAD,
  DOC_BAR_H,
  DOC_GAP,
  DOC_SLOT_H,
  DOC_LIP,
  DOC_CLIP_Y,
  type PalNotchVariant,
  type PalNotchAction,
  type PalNotchCustomerCard,
  type PalNotchOptions,
  type PalNotchNotification,
  type PalNotchConfirmOptions,
  type PalNotchPromptOptions,
  type PalNotchDocumentOptions,
  type PalNotchProps,
} from "./product/pal-notch";
export { MonthCalendar, DateField } from "./product/date-picker";
export { Calendar } from "./product/calendar-grid";
export { DatePicker } from "./product/date-input";
export { ImageUpload, type ImageUploadItem } from "./product/image-upload";
export { Modal, ModalContent, ModalHeader, ModalIconBadge, ModalTitle, ModalDescription, ModalBody, ModalFooter, ModalButton } from "./core/modal-system";
export { FileDropzone, FileChip } from "./product/file-dropzone";
export { SearchSelect, type SearchSelectOption } from "./product/search-select";
export { Sheet } from "./product/sheet";

/* Website */
export {
  Logo,
  SiteNav,
  Section,
  Eyebrow,
  SectionHeading,
  TabRail,
  CtaBand,
  WindowFrame,
  MiniCard,
  MiniField,
  SiteFooter,
} from "./website/blocks";
