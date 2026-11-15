import * as React from "react"
import {
  Users,
  FileText,
  Edit3,
  X,
  ChevronDown,
  ChevronRight,
  Trash2,
  Search,
  Plus,
  Compass,
  MapPin,
  Loader2,
  AlertCircle,
  Package,
  Check,
  Settings,
  Bell,
  HelpCircle,
  Calendar,
  LogOut,
} from "lucide-react"
import { useUser, useClerk } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { PalNotch, palNotch } from "@ui/pal-notch"
import { BadgeGroup } from "@/components/ui/badge-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalIconBadge,
  ModalButton,
} from "@ui/modal-system"
import { QuotationView, type RenegotiatingQuoteData, type QuoteSite } from "./QuotationView"
import { QuotationReportsView, type QuotationListItem } from "./QuotationReportsView"
import {
  BusinessDetailsView,
  type BusinessDetailsRecord,
  loadBusinessDetailsFromStorage,
  saveBusinessDetailsToStorage,
} from "../settings"
import type {
  CustomerRecord,
  EnquiryRecord,
  SupplierRecord,
  ProductRecord,
  MaterialRecord,
  FinishRecord,
  ServiceItem,
  SiteRecord,
  CustomerDrawerAnchor,
} from "./types"
import { leadsService } from "./leadsService"
import { validateCustomerForm, validateEnquiryForm } from "./validation"
import "./leads.css"
import { DEFAULT_MATERIALS, DEFAULT_FINISHES, DEFAULT_PRODUCTS } from "./seedCatalog"

const STORAGE_CUSTOMERS_KEY = "printpal_workshop_customers_v3"
const STORAGE_ENQUIRIES_KEY = "printpal_workshop_enquiries_v3"

interface GeoapifySuggestion {
  id: string
  name: string
  formattedAddress: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
  lat: number
  lng: number
}

export interface TaxRecord {
  id: string
  name: string
  percentage: number
}

const DEFAULT_TAXES: TaxRecord[] = [
  { id: "tax-cgst", name: "CGST", percentage: 9 },
  { id: "tax-sgst", name: "SGST", percentage: 7 },
  { id: "tax-nt-tax", name: "NT TAX (Tax Group)", percentage: 16 },
]

const GEOAPIFY_API_KEY = (import.meta.env.VITE_GEOAPIFY_API_KEY as string) || ""

const SIGNAGE_SERVICES_OPTIONS = [
  "Acrylic Sheets & Laser Cutting",
  "ACP Cladding & Router Cutting",
  "LED Modules & SMPS Drivers",
  "Neon Flex & 12V Power Supplies",
  "Vinyl Printing & Lamination",
  "Flex Banners & Backlit Substrates",
  "Aluminium Extrusions & Box Profiles",
  "MS / SS Metal Fabrication & Frames",
  "Polycarbonate & Sunpack Sheets",
  "Channel Letters & 3D Fabrication",
  "Powder Coating & Industrial Painting",
  "On-Site Installation & Mounting",
]

const DEFAULT_LOCATIONS_OPTIONS = [
  "Greater Chennai (All Industrial Zones)",
  "Kanchipuram & Sriperumbudur Hub",
  "Chengalpattu & Maraimalai Nagar",
  "Tiruvallur & Gummidipoondi",
  "Coimbatore & Tiruppur Industrial Belt",
  "Madurai & Dindigul",
  "Tiruchirappalli (Trichy)",
  "Salem & Erode",
  "Vellore & Ranipet",
  "Bangalore Urban & Electronic City",
  "Hyderabad & Secunderabad",
  "Pan-Tamil Nadu",
  "Pan-South India",
  "Pan-India Delivery",
]

/* Minimal Icon-Style Vector Illustration: Commercial Client Elevation */
function CustomerEmptyIllustration() {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="printpal-empty-vector"
    >
      {/* Background Soft Aura & Drafting Grid */}
      <circle cx="80" cy="60" r="50" fill="#F8FAFC" stroke="#EEF2F6" strokeWidth="1" strokeDasharray="3 3" />
      <ellipse cx="80" cy="65" rx="36" ry="32" fill="#F1F5F9" opacity="0.7" />

      {/* Blueprint / Architectural Dossier Card */}
      <rect x="34" y="28" width="92" height="68" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.25" />

      {/* Architectural Guidelines */}
      <line x1="46" y1="40" x2="74" y2="40" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="46" y1="48" x2="68" y2="48" stroke="#E2E8F0" strokeWidth="1.25" strokeLinecap="round" />

      {/* Commercial Storefront / Facade Elevation */}
      <rect x="62" y="38" width="56" height="52" rx="6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />

      {/* Signage Canopy / Fascia (PrintPal Signature Orange) */}
      <rect x="58" y="34" width="64" height="11" rx="3" fill="#FFF7ED" stroke="#D7440E" strokeWidth="1.25" />
      <line x1="68" y1="39.5" x2="112" y2="39.5" stroke="#D7440E" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />

      {/* Store Entrance / Glass Doors */}
      <rect x="82" y="62" width="16" height="28" rx="2" fill="#F8FAFC" stroke="#1E293B" strokeWidth="1.25" />
      <line x1="90" y1="62" x2="90" y2="90" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />

      {/* Display Windows */}
      <rect x="67" y="54" width="10" height="16" rx="2" fill="#EFF6FF" stroke="#94A3B8" strokeWidth="1" />
      <rect x="103" y="54" width="10" height="16" rx="2" fill="#EFF6FF" stroke="#94A3B8" strokeWidth="1" />

      {/* Client Dossier Avatar Badge */}
      <g transform="translate(38, 54)">
        <rect x="0" y="0" width="24" height="24" rx="12" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.25" />
        <circle cx="12" cy="9.5" r="3.5" fill="none" stroke="#2563EB" strokeWidth="1.25" />
        <path d="M6 19.5 C6 16 8.5 14.5 12 14.5 C15.5 14.5 18 16 18 19.5" fill="none" stroke="#2563EB" strokeWidth="1.25" strokeLinecap="round" />
      </g>

      {/* Engineering Precision Dimension Ticks */}
      <path d="M26 60 H30 M28 58 V62" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <path d="M130 32 H134 M132 30 V34" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="132" cy="84" r="2.5" fill="#D7440E" opacity="0.75" />
    </svg>
  );
}

/* Minimal Icon-Style Vector Illustration: Workshop Job Specification Docket */
function EnquiryEmptyIllustration() {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="printpal-empty-vector"
    >
      {/* Background Soft Aura & Drafting Grid */}
      <circle cx="80" cy="60" r="50" fill="#F8FAFC" stroke="#EEF2F6" strokeWidth="1" strokeDasharray="3 3" />
      <ellipse cx="80" cy="65" rx="36" ry="32" fill="#FFF7ED" opacity="0.45" />

      {/* Specification Clipboard Docket */}
      <rect x="42" y="28" width="76" height="68" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.25" />

      {/* Clipboard Clip */}
      <rect x="66" y="23" width="28" height="8" rx="3" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.25" />
      <circle cx="80" cy="27" r="1.5" fill="#64748B" />

      {/* Technical Spec Lines */}
      <line x1="54" y1="44" x2="84" y2="44" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="54" y1="52" x2="98" y2="52" stroke="#E2E8F0" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="54" y1="60" x2="76" y2="60" stroke="#E2E8F0" strokeWidth="1.25" strokeLinecap="round" />

      {/* Dynamic Enquiry Bubble (PrintPal Accent) */}
      <path
        d="M82 56 C82 48.5 89.5 43 99 43 C108.5 43 116 48.5 116 56 C116 60.5 113.5 64.5 109.5 66.5 L111 74 L103.5 69 C102 69.3 100.5 69.5 99 69.5 C89.5 69.5 82 64 82 56 Z"
        fill="#FFFFFF"
        stroke="#D7440E"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* 3 Message Wave Dots */}
      <circle cx="93" cy="56" r="1.5" fill="#D7440E" />
      <circle cx="99" cy="56" r="1.5" fill="#D7440E" />
      <circle cx="105" cy="56" r="1.5" fill="#D7440E" />

      {/* Minimal Architectural Ruler */}
      <g transform="translate(34, 68) rotate(-22)">
        <rect x="0" y="0" width="38" height="10" rx="2" fill="#F8FAFC" stroke="#64748B" strokeWidth="1" />
        <line x1="6" y1="0" x2="6" y2="4" stroke="#94A3B8" strokeWidth="0.75" />
        <line x1="12" y1="0" x2="12" y2="3" stroke="#94A3B8" strokeWidth="0.75" />
        <line x1="18" y1="0" x2="18" y2="4" stroke="#94A3B8" strokeWidth="0.75" />
        <line x1="24" y1="0" x2="24" y2="3" stroke="#94A3B8" strokeWidth="0.75" />
        <line x1="30" y1="0" x2="30" y2="4" stroke="#94A3B8" strokeWidth="0.75" />
      </g>

      {/* Precision Markers */}
      <path d="M30 38 H34 M32 36 V40" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="128" cy="34" r="2.5" fill="#2563EB" opacity="0.75" />
    </svg>
  );
}

/* Minimal Icon-Style Vector Illustration: Raw Substrates & Supplier Docket */
function SupplierEmptyIllustration() {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="printpal-empty-vector"
    >
      {/* Background Soft Aura & Drafting Grid */}
      <circle cx="80" cy="60" r="50" fill="#F8FAFC" stroke="#EEF2F6" strokeWidth="1" strokeDasharray="3 3" />
      <ellipse cx="80" cy="65" rx="36" ry="32" fill="#F0FDF4" opacity="0.6" />

      {/* Raw Substrate Palette / Flat Sheet Stack */}
      <rect x="36" y="32" width="88" height="64" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.25" />

      {/* Top Acrylic/ACP Sheet Layer with Precision Chamfer */}
      <path
        d="M44 42 H116 V76 H44 Z"
        fill="#F8FAFC"
        stroke="#1E293B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Sheet Returns / Substrate Thickness Layers */}
      <path d="M44 76 L48 80 H120 V46 L116 42" stroke="#CBD5E1" strokeWidth="1.25" />
      <line x1="120" y1="80" x2="116" y2="76" stroke="#94A3B8" strokeWidth="1.25" />

      {/* Material Category Spec Badges */}
      <rect x="52" y="48" width="28" height="8" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1" />
      <line x1="56" y1="52" x2="74" y2="52" stroke="#2563EB" strokeWidth="1.25" strokeLinecap="round" />

      <rect x="84" y="48" width="24" height="8" rx="2" fill="#FFF7ED" stroke="#D7440E" strokeWidth="1" />
      <line x1="88" y1="52" x2="102" y2="52" stroke="#D7440E" strokeWidth="1.25" strokeLinecap="round" />

      {/* LED Module / Power Supply Coil Indicator */}
      <g transform="translate(48, 62)">
        <circle cx="10" cy="8" r="6" fill="#FFFFFF" stroke="#10B981" strokeWidth="1.25" />
        <circle cx="10" cy="8" r="2" fill="#10B981" />
        <path d="M16 8 H28" stroke="#10B981" strokeWidth="1.25" strokeDasharray="2 2" />
        <circle cx="32" cy="8" r="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1" />
      </g>

      {/* Supplier Tag / Vendor Seal */}
      <g transform="translate(92, 60)">
        <rect x="0" y="0" width="24" height="24" rx="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.25" />
        <path d="M8 12 L11 15 L16 9" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Precision Drafting Markers */}
      <path d="M28 50 H32 M30 48 V52" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <path d="M128 34 H132 M130 32 V36" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="126" cy="86" r="2.5" fill="#10B981" opacity="0.75" />
    </svg>
  );
}

/* Minimal Icon-Style Vector Illustration: Fabricated Signage Assembly & CAD Elevation */
function ProductEmptyIllustration() {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="printpal-empty-vector"
    >
      {/* Background Soft Aura & CAD Drafting Grid */}
      <circle cx="80" cy="60" r="50" fill="#F8FAFC" stroke="#EEF2F6" strokeWidth="1" strokeDasharray="3 3" />
      <ellipse cx="80" cy="65" rx="36" ry="32" fill="#FFF7ED" opacity="0.6" />

      {/* 3D Dimensional Lightbox Base Profile */}
      <rect x="36" y="32" width="88" height="58" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.25" />

      {/* Front Cast Acrylic Face with Illumination Chamfer */}
      <path
        d="M44 40 H116 V78 H44 Z"
        fill="#FAFAFA"
        stroke="#1E293B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* 3D Depth Return Profile */}
      <path d="M44 78 L48 84 H120 V46 L116 40" stroke="#CBD5E1" strokeWidth="1.25" />
      <line x1="120" y1="84" x2="116" y2="78" stroke="#94A3B8" strokeWidth="1.25" />

      {/* Channel Letter "P" Profile with PrintPal Orange Accent */}
      <path
        d="M58 48 V70 M58 48 H72 C76 48 78 51 78 55 C78 59 76 62 72 62 H58"
        stroke="#D7440E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Internal LED Module Array */}
      <circle cx="64" cy="54" r="2" fill="#D7440E" />
      <circle cx="70" cy="55" r="2" fill="#D7440E" />
      <circle cx="64" cy="65" r="2" fill="#D7440E" />

      {/* CAD Dimension Markers (W x H) */}
      <line x1="44" y1="36" x2="116" y2="36" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 2" />
      <path d="M44 34 V38 M116 34 V38" stroke="#3B82F6" strokeWidth="1" />
      <rect x="74" y="32" width="14" height="8" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="0.75" />
      <text x="81" y="38" textAnchor="middle" fontSize="6" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold">W</text>

      {/* Workshop Seal Badge */}
      <g transform="translate(94, 58)">
        <rect x="0" y="0" width="22" height="22" rx="6" fill="#ECFDF5" stroke="#10B981" strokeWidth="1" />
        <path d="M6 11 L10 15 L16 8" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function MaterialEmptyIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="printpal-empty-vector">
      <circle cx="80" cy="60" r="50" fill="#F8FAFC" stroke="#EEF2F6" strokeWidth="1" strokeDasharray="3 3" />
      <ellipse cx="80" cy="65" rx="36" ry="32" fill="#F0FDF4" opacity="0.6" />
      <rect x="36" y="36" width="88" height="52" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.25" />
      <path d="M42 44 H118 V76 H42 Z" fill="#F8FAFC" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="42" y1="54" x2="118" y2="54" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="42" y1="64" x2="118" y2="64" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
      <g transform="translate(50, 48)">
        <rect x="0" y="0" width="20" height="8" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1" />
        <line x1="4" y1="4" x2="16" y2="4" stroke="#2563EB" strokeWidth="1.25" strokeLinecap="round" />
      </g>
      <g transform="translate(76, 48)">
        <rect x="0" y="0" width="24" height="8" rx="2" fill="#ECFDF5" stroke="#10B981" strokeWidth="1" />
        <line x1="4" y1="4" x2="20" y2="4" stroke="#059669" strokeWidth="1.25" strokeLinecap="round" />
      </g>
      <g transform="translate(94, 66)">
        <circle cx="10" cy="10" r="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
        <path d="M6 10 L9 13 L14 7" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function FinishEmptyIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="printpal-empty-vector">
      <circle cx="80" cy="60" r="50" fill="#F8FAFC" stroke="#EEF2F6" strokeWidth="1" strokeDasharray="3 3" />
      <ellipse cx="80" cy="65" rx="36" ry="32" fill="#FAF5FF" opacity="0.6" />
      <rect x="40" y="32" width="80" height="60" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.25" />
      <path d="M48 40 H112 V76 H48 Z" fill="#FAF5FF" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M52 74 L84 42 H96 L64 74 Z" fill="#9333EA" opacity="0.15" />
      <path d="M96 74 L108 62 V50 L84 74 Z" fill="#9333EA" opacity="0.15" />
      <g transform="translate(68, 52)">
        <rect x="0" y="0" width="24" height="14" rx="3" fill="#FFF7ED" stroke="#D7440E" strokeWidth="1.25" />
        <text x="12" y="10" textAnchor="middle" fontSize="7" fill="#D7440E" fontWeight="bold" fontFamily="sans-serif">RAL</text>
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ── SEARCHABLE ACTION SELECT (Search Bar + Action Footer) ──
   ═══════════════════════════════════════════════════════════════════ */

interface SearchableActionOption {
  value: string
  label: string
}

interface SearchableActionSelectProps {
  value?: string
  onChange: (value: string) => void
  options: SearchableActionOption[]
  placeholder?: string
  searchPlaceholder?: string
  addActionText: string
  onAddAction: () => void
  emptyMessage?: string
  error?: boolean
  disabled?: boolean
  className?: string
}

const SearchableActionSelect: React.FC<SearchableActionSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  addActionText,
  onAddAction,
  emptyMessage = "No options found",
  error = false,
  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => opt.label.toLowerCase().includes(q))
  }, [options, search])

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value)
  }, [options, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          className={`w-full h-9 px-3 bg-white border rounded-[6px] text-[13px] flex items-center justify-between transition-colors text-left outline-none ${disabled
            ? "opacity-60 cursor-not-allowed bg-[#F9FAFB] border-[#E5E7EB] text-[#737B84]"
            : error
              ? "border-red-500 text-[#202428] hover:border-red-600 focus:border-red-500"
              : open
                ? "border-[#2878D0] ring-1 ring-[#2878D0] text-[#202428]"
                : "border-[#DCE1E5] text-[#202428] hover:border-[#b5bfc7]"
            } ${className}`}
        >
          <span className={`truncate ${!selectedOption && !value ? "text-[#737B84]" : "text-[#202428]"}`}>
            {selectedOption ? selectedOption.label : value || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-[#737B84] shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0 bg-white border border-[#DCE1E5] shadow-xl rounded-lg overflow-hidden z-[9999]"
      >
        {/* Top Search Field */}
        <div className="flex items-center gap-2.5 border-b border-[#DCE1E5] px-3 h-[46px] bg-[#F8FAFC] rounded-t-lg w-full box-border overflow-hidden">
          <Search className="h-4 w-4 text-[#737B84] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 min-w-0 h-full text-[13px] text-[#202428] placeholder:text-[#737B84] outline-none bg-transparent"
            autoFocus
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-[#737B84] hover:text-[#202428] shrink-0 p-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Option List */}
        <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5 printpal-compact-scroll">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-[13px] cursor-pointer select-none transition-colors ${isSelected
                    ? "bg-[#D7440E]/5 text-[#202428] font-medium"
                    : "text-[#202428] hover:bg-[#F3F5F7]"
                    }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-[#D7440E] shrink-0" />}
                </div>
              )
            })
          ) : (
            <div className="px-3 py-4 text-center text-xs text-[#737B84]">
              {emptyMessage}
            </div>
          )}
        </div>

        {/* Bottom Add Action Button */}
        <div className="border-t border-[#DCE1E5] p-2 bg-[#F8FAFC]">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setSearch("")
              onAddAction()
            }}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#D7440E] hover:underline px-2 py-1 w-full text-left transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{addActionText}</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ── APPLE/GOOGLE FLUID MEMOIZED TABLE ROWS (120 FPS Rendering) ──
   ═══════════════════════════════════════════════════════════════════ */

interface CustomerRowProps {
  cust: CustomerRecord
  onEdit: (cust: CustomerRecord) => void
  onDelete: (id: string, name: string) => void
  onViewSites: (cust: CustomerRecord) => void
}

const CustomerRow = React.memo(function CustomerRow({
  cust,
  onEdit,
  onDelete,
  onViewSites,
}: CustomerRowProps) {
  return (
    <div className="printpal-table-row">
      <div className="printpal-cell-name font-medium pr-3">{cust.name}</div>
      <div className="printpal-cell-number">{cust.phone}</div>
      <div className="printpal-cell-email">{cust.email || "—"}</div>
      <div className="printpal-cell-address">
        <span>{cust.address}</span>
        {cust.sites && cust.sites.length > 1 && (
          <div className="printpal-multi-sites-wrapper">
            <span>has </span>
            <a
              href="#"
              className="printpal-multi-sites-link"
              onClick={(e) => {
                e.preventDefault()
                onViewSites(cust)
              }}
            >
              Multiple Sites ({cust.sites.length})
            </a>
          </div>
        )}
      </div>
      <div className="printpal-cell-actions">
        <button
          type="button"
          className="printpal-btn-edit-icon"
          title="Edit Customer"
          onClick={() => onEdit(cust)}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="printpal-btn-delete-icon"
          title="Delete Customer"
          onClick={() => onDelete(cust.id, cust.name)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

interface EnquiryRowProps {
  enq: EnquiryRecord
  onEdit: (enq: EnquiryRecord) => void
  onDelete: (id: string, name: string) => void
}

const EnquiryRow = React.memo(function EnquiryRow({
  enq,
  onEdit,
  onDelete,
}: EnquiryRowProps) {
  const isFollowUp =
    enq.stage === "NEEDS_FOLLOW_UP" ||
    enq.stage === "QUALIFYING" ||
    Boolean(enq.followUpDate)

  const stageLabel = isFollowUp
    ? "Needs Follow Up"
    : enq.stage === "NEW"
      ? "New"
      : enq.stage

  return (
    <div className="printpal-table-row">
      <div className="printpal-cell-name font-medium pr-3">{enq.contactName}</div>
      <div className="printpal-cell-number">{enq.phone}</div>
      <div className="printpal-cell-email">{enq.email || "—"}</div>
      <div className="printpal-cell-address">
        <div>{enq.address || "—"}</div>
        {enq.followUpDate && (
          <div className="text-[11px] text-[#B45309] font-medium flex items-center gap-1 mt-0.5">
            <Calendar className="h-3 w-3 inline shrink-0" />
            <span>Follow-up: {enq.followUpDate}</span>
          </div>
        )}
      </div>
      <div className="printpal-cell-actions">
        <span
          className={`printpal-tag ${isFollowUp ? "printpal-tag-followup" : ""}`}
          style={{
            marginRight: "8px",
            ...(isFollowUp
              ? {
                backgroundColor: "#FEF3C7",
                color: "#B45309",
                borderColor: "#FDE68A",
                fontWeight: 600,
              }
              : {}),
          }}
        >
          {stageLabel}
        </span>
        <button
          type="button"
          className="printpal-btn-edit-icon"
          title="View / Edit Enquiry"
          onClick={() => onEdit(enq)}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="printpal-btn-delete-icon"
          title="Delete Enquiry"
          onClick={() => onDelete(enq.id, enq.contactName)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

interface SupplierRowProps {
  supp: SupplierRecord
  onEdit: (supp: SupplierRecord) => void
  onDelete: (id: string, name: string) => void
}

const SupplierRow = React.memo(function SupplierRow({
  supp,
  onEdit,
  onDelete,
}: SupplierRowProps) {
  return (
    <div className="printpal-table-row printpal-supplier-grid">
      <div className="printpal-cell-name font-medium pr-3">
        {supp.supplierName}
        {supp.gstin && (
          <div className="text-[11px] text-[#737B84] font-normal">GST: {supp.gstin}</div>
        )}
      </div>
      <div className="printpal-cell-name">{supp.contactPerson || "—"}</div>
      <div className="printpal-cell-number">
        {supp.phone}
        {supp.email && (
          <div className="text-[11px] text-[#737B84] font-normal">{supp.email}</div>
        )}
      </div>
      <div className="printpal-cell-address">
        <div>{supp.category}</div>
        {supp.city && <div className="text-[11px] text-[#737B84] font-normal">({supp.city})</div>}
      </div>
      <div className="printpal-cell-actions">
        <button
          type="button"
          className="printpal-btn-edit-icon"
          title="Edit Supplier"
          onClick={() => onEdit(supp)}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="printpal-btn-delete-icon"
          title="Delete Supplier"
          onClick={() => onDelete(supp.id, supp.supplierName)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

interface ProductRowProps {
  prod: ProductRecord
  materials?: MaterialRecord[]
  finishes?: FinishRecord[]
  onEdit: (prod: ProductRecord) => void
  onDelete: (id: string, name: string) => void
}

const ProductRow = React.memo(function ProductRow({
  prod,
  materials,
  finishes,
  onEdit,
  onDelete,
}: ProductRowProps) {
  const matCount = prod.materialIds?.length || 0
  const finCount = prod.finishIds?.length || 0

  const allMatNames = React.useMemo(() => {
    if (!materials || !prod.materialIds) return ""
    return prod.materialIds
      .map((id) => materials.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }, [prod.materialIds, materials])

  const allFinNames = React.useMemo(() => {
    if (!finishes || !prod.finishIds) return ""
    return prod.finishIds
      .map((id) => finishes.find((f) => f.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }, [prod.finishIds, finishes])

  return (
    <div className="printpal-table-row printpal-product-grid printpal-product-row">
      {/* 1. Product Name */}
      <div className="font-medium text-[#202428] pr-3 truncate text-[14px]" title={prod.title}>
        {prod.title}
      </div>

      {/* 2. Description */}
      <div className="text-[13px] text-[#737B84] line-clamp-2 pr-3 leading-snug" title={prod.description || ""}>
        {prod.description || "—"}
      </div>

      {/* 3. Materials Tagged (Pure plain text numerical value) */}
      <div
        className="font-medium text-[14px] text-[#202428] text-center cursor-default"
        title={allMatNames ? `Materials (${matCount}):\n${allMatNames}` : undefined}
      >
        {matCount}
      </div>

      {/* 4. Finishes Tagged (Pure plain text numerical value) */}
      <div
        className="font-medium text-[14px] text-[#202428] text-center cursor-default"
        title={allFinNames ? `Finishes (${finCount}):\n${allFinNames}` : undefined}
      >
        {finCount}
      </div>

      {/* 5. Actions (Bare icons without container box) */}
      <div className="flex items-center gap-1.5 justify-end">
        <button
          type="button"
          className="p-1 text-[#60A5FA] hover:text-[#2563EB] transition-colors cursor-pointer bg-transparent border-0 outline-none"
          title="Edit Product"
          onClick={() => onEdit(prod)}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-1 text-[#F87171] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-0 outline-none"
          title="Delete Product"
          onClick={() => onDelete(prod.id, prod.title)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

interface MaterialRowProps {
  mat: MaterialRecord
  onEdit: (mat: MaterialRecord) => void
  onDelete: (id: string, name: string) => void
}

const MaterialRow = React.memo(function MaterialRow({
  mat,
  onEdit,
  onDelete,
}: MaterialRowProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 min-h-[48px] hover:bg-[#FBFCFD] transition-colors border-b border-[#DCE1E5] last:border-b-0 gap-2">
      <div className="text-[14px] font-medium text-[#202428] break-words leading-snug flex-1 pr-1" title={mat.name}>
        {mat.name}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          className="p-1 text-[#60A5FA] hover:text-[#2563EB] transition-colors cursor-pointer bg-transparent border-0 outline-none"
          title="Edit Material"
          onClick={() => onEdit(mat)}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-1 text-[#F87171] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-0 outline-none"
          title="Delete Material"
          onClick={() => onDelete(mat.id, mat.name)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

interface FinishRowProps {
  fin: FinishRecord
  onEdit: (fin: FinishRecord) => void
  onDelete: (id: string, name: string) => void
}

const FinishRow = React.memo(function FinishRow({
  fin,
  onEdit,
  onDelete,
}: FinishRowProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 min-h-[48px] hover:bg-[#FBFCFD] transition-colors border-b border-[#DCE1E5] last:border-b-0 gap-2">
      <div className="text-[14px] font-medium text-[#202428] break-words leading-snug flex-1 pr-1" title={fin.name}>
        {fin.name}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          className="p-1 text-[#60A5FA] hover:text-[#2563EB] transition-colors cursor-pointer bg-transparent border-0 outline-none"
          title="Edit Finish"
          onClick={() => onEdit(fin)}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-1 text-[#F87171] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-0 outline-none"
          title="Delete Finish"
          onClick={() => onDelete(fin.id, fin.name)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

export function getNextQuoteVersion(currentQuoteNumber: string): {
  nextQuoteNumber: string
  versionNumber: number
  versionLabel: string
} {
  if (!currentQuoteNumber) {
    return {
      nextQuoteNumber: "Q-001-V2",
      versionNumber: 2,
      versionLabel: "Version 2",
    }
  }

  const match = currentQuoteNumber.match(/^(.*?)(?:[-_ ]?[vV](\d+))$/)
  if (match) {
    const base = match[1]
    const currentVer = parseInt(match[2], 10) || 1
    const nextVer = currentVer + 1
    return {
      nextQuoteNumber: `${base}-V${nextVer}`,
      versionNumber: nextVer,
      versionLabel: `Version ${nextVer}`,
    }
  }

  return {
    nextQuoteNumber: `${currentQuoteNumber}-V2`,
    versionNumber: 2,
    versionLabel: "Version 2",
  }
}

export function LeadsApp() {
  const [activeModule, setActiveModule] = React.useState<"leads" | "quotation" | "quotationReports" | "settings">(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes("setting") || hash.includes("product")) return "settings"
      if (hash.includes("quotation-reports") || hash.includes("quotationreports") || hash.includes("billing-reports") || hash.includes("billingreports")) return "quotationReports"
      if (hash.includes("quotation") || hash.includes("quote") || hash.includes("billing")) return "quotation"
    }
    return "leads"
  })
  const [activeTab, setActiveTab] = React.useState<"customer" | "enquiry" | "supplier">("customer")
  const [customers, setCustomers] = React.useState<CustomerRecord[]>([])
  const [enquiries, setEnquiries] = React.useState<EnquiryRecord[]>([])
  const [suppliers, setSuppliers] = React.useState<SupplierRecord[]>([])
  const [products, setProducts] = React.useState<ProductRecord[]>([])
  const [materials, setMaterials] = React.useState<MaterialRecord[]>([])
  const [finishes, setFinishes] = React.useState<FinishRecord[]>([])
  const [quotationSelectedCustomer, setQuotationSelectedCustomer] = React.useState<CustomerRecord | null>(null)
  const [renegotiatingQuote, setRenegotiatingQuote] = React.useState<RenegotiatingQuoteData | null>(null)

  // Settings Module State
  const [settingsMenu, setSettingsMenu] = React.useState<"businessDetails" | "products" | "materials" | "finishes" | "tax" | "supplier">("products")
  const [expandedSettingsGroups, setExpandedSettingsGroups] = React.useState<{
    businessSetting: boolean
    products: boolean
    quotation: boolean
    supplier: boolean
  }>({
    businessSetting: true,
    products: true,
    quotation: false,
    supplier: true,
  })

  const toggleSettingsGroup = (group: "businessSetting" | "products" | "quotation" | "supplier") => {
    setExpandedSettingsGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  // Business Details State
  const [businessDetails, setBusinessDetails] = React.useState<BusinessDetailsRecord>(() =>
    loadBusinessDetailsFromStorage()
  )

  // Supplier Module Enable/Disable State
  const [isSupplierEnabled, setIsSupplierEnabled] = React.useState<boolean>(() => {
    const saved = localStorage.getItem("printpal_supplier_enabled")
    return saved !== null ? saved === "true" : true
  })

  React.useEffect(() => {
    if (!isSupplierEnabled && activeTab === "supplier") {
      setActiveTab("customer")
    }
  }, [isSupplierEnabled, activeTab])

  // Tax Settings State
  const [taxes, setTaxes] = React.useState<TaxRecord[]>(DEFAULT_TAXES)
  const [applyTaxesToSaleableItems, setApplyTaxesToSaleableItems] = React.useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("printpal_apply_taxes")
      return saved !== null ? saved === "true" : true
    } catch {
      return true
    }
  })
  const [isTaxModalOpen, setIsTaxModalOpen] = React.useState(false)
  const [editingTax, setEditingTax] = React.useState<TaxRecord | null>(null)
  const [taxForm, setTaxForm] = React.useState<{ name: string; percentage: string }>({
    name: "",
    percentage: "",
  })
  const [taxErrors, setTaxErrors] = React.useState<{ name?: string; percentage?: string }>({})



  // Material Form State
  const [materialForm, setMaterialForm] = React.useState<{
    name: string
    category: string
    thickness: string
    standardSize: string
    application: "Indoor" | "Outdoor" | "Coastal"
    supplierName: string
    notes: string
  }>({
    name: "",
    category: "Acrylic & Diffusers",
    thickness: "3mm",
    standardSize: "8 × 4 ft Sheet",
    application: "Outdoor",
    supplierName: "",
    notes: "",
  })
  const [materialErrors, setMaterialErrors] = React.useState<Record<string, string>>({})
  const [editingMaterialId, setEditingMaterialId] = React.useState<string | null>(null)

  // Finish Form State
  const [finishForm, setFinishForm] = React.useState<{
    name: string
    type: string
    colorCode: string
    application: "Indoor" | "Outdoor" | "Coastal"
    notes: string
  }>({
    name: "",
    type: "Powder Coating",
    colorCode: "RAL 9016 (Pure White)",
    application: "Outdoor",
    notes: "",
  })
  const [finishErrors, setFinishErrors] = React.useState<Record<string, string>>({})
  const [editingFinishId, setEditingFinishId] = React.useState<string | null>(null)

  // Product Form State
  const [productForm, setProductForm] = React.useState({
    title: "",
    category: "Channel Letters",
    description: "",
    pricedPer: "Per letter" as "Per letter" | "Per sq ft" | "Per inch" | "Per running ft" | "Per piece" | "Lump sum",
    materialIds: [] as string[],
    finishIds: [] as string[],
    isActive: true,
    width: "1200",
    height: "600",
    unit: "mm",
    returnDepth: "75mm",
    minStroke: "15mm",
    material: "",
    finishing: "",
    colour: "",
    application: "Outdoor" as "Indoor" | "Outdoor" | "Coastal",
    productionType: "INTERNAL" as "INTERNAL" | "OUTSOURCE" | "HYBRID",
    illumination: "Samsung 12V 6500K IP67 LED Modules",
    mounting: "Flush Stud Mount with Acrylic Standoffs",
    leadTime: "3-5 Working Days",
    notes: "",
  })
  const [productErrors, setProductErrors] = React.useState<Record<string, string>>({})
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null)

  const [materialsSearchInDrawer, setMaterialsSearchInDrawer] = React.useState("")
  const [finishesSearchInDrawer, setFinishesSearchInDrawer] = React.useState("")

  // Quick Product Modal & Service target tracker
  const [isQuickProductModalOpen, setIsQuickProductModalOpen] = React.useState(false)
  const [quickProductName, setQuickProductName] = React.useState("")
  const [quickProductError, setQuickProductError] = React.useState<string | null>(null)
  const [quickProductDesc, setQuickProductDesc] = React.useState("")
  const [quickProductSelectedMats, setQuickProductSelectedMats] = React.useState<string[]>([])
  const [quickProductSelectedFins, setQuickProductSelectedFins] = React.useState<string[]>([])
  const [quickTargetService, setQuickTargetService] = React.useState<{ siteIdx: number; srvIdx: number } | null>(null)
  const [productDrawerReturnTitle, setProductDrawerReturnTitle] = React.useState<string | null>(null)

  // Supplier Form State
  const [supplierForm, setSupplierForm] = React.useState<{
    supplierName: string
    contactPerson: string
    phone: string
    email: string
    isWhatsAppSame: boolean
    whatsappNumber: string
    category: string
    gstin: string
    address: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    pincode: string
    servingRegions: string
    isBillingSameAsWarehouse: boolean
    billingAddress: string
    billingAddressLine1: string
    billingAddressLine2: string
    billingCity: string
    billingState: string
    billingPincode: string
    isShippingSameAsBilling: boolean
    shippingAddress: string
    shippingAddressLine1: string
    shippingAddressLine2: string
    shippingCity: string
    shippingState: string
    shippingPincode: string
    deliveryLeadTime: string
    minOrderQty: string
    paymentTerms: string
    notes: string
  }>({
    supplierName: "",
    contactPerson: "",
    phone: "",
    email: "",
    isWhatsAppSame: true,
    whatsappNumber: "",
    category: "",
    gstin: "",
    address: "",
    addressLine1: "",
    addressLine2: "",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600032",
    servingRegions: "Greater Chennai (All Industrial Zones)",
    isBillingSameAsWarehouse: true,
    billingAddress: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingCity: "Chennai",
    billingState: "Tamil Nadu",
    billingPincode: "600032",
    isShippingSameAsBilling: true,
    shippingAddress: "PrintPal Workshop & Factory, No. 8 Industrial Estate, Guindy, Chennai 600032",
    shippingAddressLine1: "No. 8 Industrial Estate",
    shippingAddressLine2: "Guindy",
    shippingCity: "Chennai",
    shippingState: "Tamil Nadu",
    shippingPincode: "600032",
    deliveryLeadTime: "Same Day (2-4 hrs)",
    minOrderQty: "1 sheet / 1 pc",
    paymentTerms: "ADVANCE",
    notes: "",
  })
  const [supplierErrors, setSupplierErrors] = React.useState<Record<string, string>>({})
  const [editingSupplierId, setEditingSupplierId] = React.useState<string | null>(null)

  // Supplier multi-select dropdown states
  const [servicesDropdownOpen, setServicesDropdownOpen] = React.useState(false)
  const [servicesSearchQuery, setServicesSearchQuery] = React.useState("")
  const [locationsDropdownOpen, setLocationsDropdownOpen] = React.useState(false)
  const [locationsSearchQuery, setLocationsSearchQuery] = React.useState("")

  // Modal & Drawer State (Desktop - 4)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingCustomerId, setEditingCustomerId] = React.useState<string | null>(null)
  const [editingEnquiryId, setEditingEnquiryId] = React.useState<string | null>(null)
  const [activeRightTab, setActiveRightTab] = React.useState<"services" | "billing">("services")
  const [collapsedSites, setCollapsedSites] = React.useState<Set<string>>(new Set())
  const [drawerAnchor, setDrawerAnchor] = React.useState<CustomerDrawerAnchor | null>(null)
  const [highlightedAnchorKey, setHighlightedAnchorKey] = React.useState<string | null>(null)

  // Multi-Site Modal State (Desktop - 2)
  const [selectedCustomerForSites, setSelectedCustomerForSites] = React.useState<CustomerRecord | null>(null)

  // Validation & Toast States
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})
  const [drawerTitle, setDrawerTitle] = React.useState<string>("New Customer")

  // Clerk Authentication & Session State
  const { user } = useUser()
  const clerk = useClerk()
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
  const hasAnnouncedLogin = React.useRef(false)

  React.useEffect(() => {
    if (user && !hasAnnouncedLogin.current) {
      hasAnnouncedLogin.current = true
      const email = user.primaryEmailAddress?.emailAddress || ""
      const displayName = user.firstName || user.fullName || email.split("@")[0] || "Operator"

      // 1. Sync with Neon PostgreSQL backend
      fetch("/api/auth/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email,
          fullName: user.fullName || displayName,
          imageUrl: user.imageUrl,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.tenantId) {
            localStorage.setItem("printpal_active_tenant_id", data.tenantId)
          }
        })
        .catch((err) => console.warn("[Auth Sync] Notice:", err))

      // 2. Announce Login Successful in Pal Notch Dynamic Island
      palNotch.notify({
        title: `Login successful — Welcome, ${displayName}!`,
        variant: "success",
        duration: 4000,
      })
    }
  }, [user])

  const showToast = React.useCallback(
    (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
      palNotch.notify({
        title: message,
        variant: type,
      })
    },
    []
  )

  const handleOpenAddTaxModal = React.useCallback(() => {
    setEditingTax(null)
    setTaxForm({ name: "", percentage: "" })
    setTaxErrors({})
    setIsTaxModalOpen(true)
  }, [])

  const handleOpenEditTaxModal = React.useCallback((tax: TaxRecord) => {
    setEditingTax(tax)
    setTaxForm({ name: tax.name, percentage: String(tax.percentage) })
    setTaxErrors({})
    setIsTaxModalOpen(true)
  }, [])

  const handleSaveTax = React.useCallback(() => {
    const trimmedName = taxForm.name.trim()
    const parsedPercentage = parseFloat(taxForm.percentage)
    const errors: { name?: string; percentage?: string } = {}

    if (!trimmedName) {
      errors.name = "Tax name is required"
    }
    if (isNaN(parsedPercentage) || parsedPercentage < 0 || parsedPercentage > 100) {
      errors.percentage = "Enter a valid percentage between 0 and 100"
    }

    if (Object.keys(errors).length > 0) {
      setTaxErrors(errors)
      return
    }

    setTaxErrors({})

    if (editingTax) {
      setTaxes((prev) =>
        prev.map((t) => (t.id === editingTax.id ? { ...t, name: trimmedName, percentage: parsedPercentage } : t))
      )
      showToast(`Tax "${trimmedName}" updated successfully`, "success")
    } else {
      const newTax: TaxRecord = {
        id: `tax_${Date.now()}`,
        name: trimmedName,
        percentage: parsedPercentage,
      }
      setTaxes((prev) => [...prev, newTax])
      showToast(`Tax "${trimmedName}" created successfully`, "success")
    }

    setIsTaxModalOpen(false)
    setEditingTax(null)
    setTaxForm({ name: "", percentage: "" })
    setTaxErrors({})
  }, [taxForm, editingTax, showToast])

  const handleSaveBusinessDetails = React.useCallback(
    async (updated: BusinessDetailsRecord) => {
      saveBusinessDetailsToStorage(updated)
      setBusinessDetails(updated)
      try {
        const res = await fetch("/api/business-details", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        })
        if (res.ok) {
          showToast("Business details updated successfully", "success")
          return
        }
      } catch {
        // Offline / localStorage persisted fallback
      }
      showToast("Business details updated locally", "success")
    },
    [showToast]
  )

  // Geoapify Places Autocomplete State
  const [isSearchingPlaces, setIsSearchingPlaces] = React.useState(false)
  const [geoapifyPredictions, setGeoapifyPredictions] = React.useState<GeoapifySuggestion[]>([])

  // Form State: Sites & Services
  const [formSites, setFormSites] = React.useState<SiteRecord[]>([])

  React.useEffect(() => {
    if (!highlightedAnchorKey) return
    const timer = window.setTimeout(() => {
      setHighlightedAnchorKey(null)
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [highlightedAnchorKey])

  React.useEffect(() => {
    if (!isModalOpen || !drawerAnchor) return

    let targetDomId: string | null = null
    let focusDomId: string | null = null
    let blockAlign: ScrollLogicalPosition = "start"

    if (drawerAnchor.section === "basic") {
      targetDomId = "drawer-basic-details-card"
      focusDomId = "input-biz-name"
    } else if (drawerAnchor.section === "add-site") {
      targetDomId = "drawer-add-site-btn"
      focusDomId = "drawer-add-site-btn"
      blockAlign = "center"
    } else {
      const matchedById = drawerAnchor.siteId
        ? formSites.findIndex((s) => s.id === drawerAnchor.siteId)
        : -1
      const resolvedSiteIdx =
        matchedById >= 0
          ? matchedById
          : Math.min(Math.max(drawerAnchor.siteIdx ?? 0, 0), Math.max(formSites.length - 1, 0))

      if (drawerAnchor.section === "site") {
        targetDomId = `drawer-site-${resolvedSiteIdx}`
        focusDomId = `drawer-site-${resolvedSiteIdx}-name`
      } else if (drawerAnchor.section === "add-service") {
        targetDomId = `drawer-site-${resolvedSiteIdx}-add-service`
        focusDomId = `drawer-site-${resolvedSiteIdx}-add-service`
        blockAlign = "center"
      } else if (drawerAnchor.section === "service") {
        const services = formSites[resolvedSiteIdx]?.serviceDetails || []
        if (services.length > 0) {
          const matchedSrvById = drawerAnchor.serviceId
            ? services.findIndex((srv) => srv.id === drawerAnchor.serviceId)
            : -1
          const resolvedSrvIdx =
            matchedSrvById >= 0
              ? matchedSrvById
              : Math.min(Math.max(drawerAnchor.serviceIdx ?? 0, 0), services.length - 1)
          targetDomId = `drawer-site-${resolvedSiteIdx}-service-${resolvedSrvIdx}`
        } else {
          targetDomId = `drawer-site-${resolvedSiteIdx}`
        }
      }
    }

    if (!targetDomId) return

    const resolvedId = targetDomId
    const scrollTimer = window.setTimeout(() => {
      const el = document.getElementById(resolvedId)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: blockAlign })
        setHighlightedAnchorKey(resolvedId)
      }
      if (focusDomId) {
        const focusEl = document.getElementById(focusDomId)
        if (focusEl && typeof focusEl.focus === "function") {
          focusEl.focus({ preventScroll: true })
        }
      }
      setDrawerAnchor(null)
    }, 120)

    return () => window.clearTimeout(scrollTimer)
  }, [isModalOpen, drawerAnchor, formSites])

  // Active Search State
  const [activeSearchSiteId, setActiveSearchSiteId] = React.useState<string | null>(null)

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".printpal-site-search-wrapper")) {
        setActiveSearchSiteId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Live Geoapify Places Predictions
  React.useEffect(() => {
    if (!activeSearchSiteId) {
      setGeoapifyPredictions([])
      setIsSearchingPlaces(false)
      return
    }
    const currentSite = formSites.find((s) => s.id === activeSearchSiteId)
    const query = (currentSite?.address || "").trim()
    if (!query || query.length < 2) {
      setGeoapifyPredictions([])
      setIsSearchingPlaces(false)
      return
    }

    if (!GEOAPIFY_API_KEY) {
      setGeoapifyPredictions([])
      setIsSearchingPlaces(false)
      return
    }

    setIsSearchingPlaces(true)
    const timer = setTimeout(async () => {
      try {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&bias=countrycode:in&limit=5&apiKey=${GEOAPIFY_API_KEY}`
        const res = await fetch(url)
        if (!res.ok) {
          setIsSearchingPlaces(false)
          setGeoapifyPredictions([])
          return
        }
        const data = await res.json()
        const features = data.features || []
        const mapped: GeoapifySuggestion[] = features.map((f: any, idx: number) => {
          const p = f.properties || {}
          const line1 = p.address_line1 || [p.housenumber, p.street].filter(Boolean).join(" ") || p.name || ""
          const line2 = p.suburb || p.district || p.neighbourhood || p.address_line2 || ""
          const cityName = p.city || p.town || p.village || p.county || ""
          return {
            id: p.place_id || `geo-${idx}-${Date.now()}`,
            name: p.name || line1 || cityName,
            formattedAddress: p.formatted || `${line1}, ${cityName}`,
            addressLine1: line1,
            addressLine2: line2,
            city: cityName,
            state: p.state || "",
            pincode: p.postcode || "",
            lat: p.lat ?? f.geometry?.coordinates?.[1] ?? 0,
            lng: p.lon ?? f.geometry?.coordinates?.[0] ?? 0,
          }
        })
        setGeoapifyPredictions(mapped)
      } catch {
        setGeoapifyPredictions([])
      } finally {
        setIsSearchingPlaces(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [activeSearchSiteId, formSites])

  const handleSelectPlace = (siteIdx: number, place: GeoapifySuggestion) => {
    const updated = [...formSites]
    updated[siteIdx] = {
      ...updated[siteIdx],
      // siteName is only populated from the text entered in the Site Name field
      address: place.formattedAddress,
      addressLine1: place.addressLine1,
      addressLine2: place.addressLine2,
      city: place.city || "Bengaluru",
      state: place.state || "Karnataka",
      pincode: place.pincode || "560001",
      lat: place.lat,
      lng: place.lng,
      placeId: place.id,
    }
    setFormSites(updated)
    setActiveSearchSiteId(null)
    setGeoapifyPredictions([])
    palNotch.info("Site location pinned", place.formattedAddress, undefined, "GEO")
  }

  const handleOpenLiveView = (site: SiteRecord) => {
    if (!site.lat || !site.lng) return
    // Direct Google Maps 360-degree panorama Street View mode (free, no API key needed)
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${site.lat},${site.lng}&heading=0&pitch=0&fov=80`
    window.open(url, "_blank", "noopener,noreferrer")
    palNotch.info(
      "Opened 360° Street View",
      site.siteName || site.address || "Live site panorama",
      undefined,
      "MAP"
    )
  }

  // Form State: Basic Details
  const [formBasicDetails, setFormBasicDetails] = React.useState({
    businessName: "",
    primaryContactName: "",
    primaryContactNumber: "",
    isWhatsAppSame: true,
    whatsappNumber: "",
    email: "",
    followUpDate: "",
  })

  // Form State: Billing Details
  const [billingDetails, setBillingDetails] = React.useState({
    billingName: "",
    gstin: "",
    billingAddress: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600051",
    isShippingSameAsBilling: true,
    shippingAddress: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "Chennai",
    shippingState: "Tamil Nadu",
    shippingPincode: "600051",
  })

  // Load Initial State from Live Fastify PostgreSQL 16 Backend
  React.useEffect(() => {
    async function loadData() {
      // 1. Purge stale mock data from previous sessions
      try {
        const savedCust = localStorage.getItem(STORAGE_CUSTOMERS_KEY)
        if (savedCust) {
          const parsed = JSON.parse(savedCust)
          const cleaned = parsed.filter(
            (c: any) => c.id !== "cust-1" && c.id !== "cust-2" && c.businessName !== "John Doe"
          )
          localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(cleaned))
        }

        const savedEnq = localStorage.getItem(STORAGE_ENQUIRIES_KEY)
        if (savedEnq) {
          const parsed = JSON.parse(savedEnq)
          const cleaned = parsed.filter((e: any) => e.id !== "enq-1")
          localStorage.setItem(STORAGE_ENQUIRIES_KEY, JSON.stringify(cleaned))
        }
      } catch { }

      // 2. Fetch live data from PostgreSQL 16 via Fastify
      try {
        const [loadedCustomers, loadedEnquiries, loadedSuppliers, loadedProducts, loadedMaterials, loadedFinishes, loadedBusinessDetails] = await Promise.all([
          leadsService.getCustomers(),
          leadsService.getEnquiries(),
          leadsService.getSuppliers(),
          leadsService.getProducts(),
          leadsService.getMaterials(),
          leadsService.getFinishes(),
          fetch("/api/business-details").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ])

        if (loadedBusinessDetails && loadedBusinessDetails.legalName !== undefined) {
          setBusinessDetails((prev) => {
            const merged = { ...prev, ...loadedBusinessDetails }
            saveBusinessDetailsToStorage(merged)
            return merged
          })
        }

        const cleanCustomers = (loadedCustomers || []).filter(
          (c) => c.id !== "cust-1" && c.id !== "cust-2" && c.businessName !== "John Doe"
        )
        const cleanEnquiries = (loadedEnquiries || []).filter((e) => e.id !== "enq-1")

        setCustomers(cleanCustomers)
        setEnquiries(cleanEnquiries)
        setSuppliers(loadedSuppliers || [])

        if (loadedProducts) {
          setProducts(loadedProducts)
        } else {
          setProducts(DEFAULT_PRODUCTS)
          for (const p of DEFAULT_PRODUCTS) {
            void leadsService.saveProduct(p)
          }
        }

        if (loadedMaterials) {
          setMaterials(loadedMaterials)
        } else {
          setMaterials(DEFAULT_MATERIALS)
          for (const m of DEFAULT_MATERIALS) {
            void leadsService.saveMaterial(m)
          }
        }

        if (loadedFinishes) {
          setFinishes(loadedFinishes)
        } else {
          setFinishes(DEFAULT_FINISHES)
          for (const f of DEFAULT_FINISHES) {
            void leadsService.saveFinish(f)
          }
        }
      } catch (err) {
        console.warn("[PrintPal] Initial data load fallback:", err)
      }
    }

    loadData()
  }, [])

  // Keyboard shortcut: Escape to close modals
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) closeNewCustomerModal()
        if (selectedCustomerForSites) setSelectedCustomerForSites(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen, selectedCustomerForSites])

  const executeDelete = React.useCallback(
    async (
      type: "customer" | "enquiry" | "supplier" | "product" | "material" | "finish" | "tax",
      id: string,
      name: string
    ) => {
      try {
        if (type === "customer") {
          await leadsService.deleteCustomer(id)
          setCustomers((prev) => prev.filter((c) => c.id !== id))
          showToast(`Customer "${name}" deleted successfully`, "success")
        } else if (type === "enquiry") {
          await leadsService.deleteEnquiry(id)
          setEnquiries((prev) => prev.filter((e) => e.id !== id))
          showToast(`Enquiry "${name}" deleted successfully`, "success")
        } else if (type === "supplier") {
          await leadsService.deleteSupplier(id)
          setSuppliers((prev) => prev.filter((s) => s.id !== id))
          showToast(`Supplier "${name}" deleted successfully`, "success")
        } else if (type === "product") {
          await leadsService.deleteProduct(id)
          setProducts((prev) => prev.filter((p) => p.id !== id))
          showToast(`Product "${name}" deleted successfully`, "success")
        } else if (type === "material") {
          await leadsService.deleteMaterial(id)
          setMaterials((prev) => prev.filter((m) => m.id !== id))
          showToast(`Material "${name}" deleted successfully`, "success")
        } else if (type === "finish") {
          await leadsService.deleteFinish(id)
          setFinishes((prev) => prev.filter((f) => f.id !== id))
          showToast(`Finish "${name}" deleted successfully`, "success")
        } else if (type === "tax") {
          setTaxes((prev) => prev.filter((t) => t.id !== id))
          showToast(`Tax "${name}" deleted successfully`, "success")
        }
      } catch (err) {
        showToast(`Failed to delete ${type}`, "error")
      }
    },
    [showToast]
  )

  const openDrawer = (
    isEdit = false,
    cust?: CustomerRecord,
    title?: string,
    anchor?: CustomerDrawerAnchor
  ) => {
    setFormErrors({})
    setDrawerAnchor(anchor || null)
    setHighlightedAnchorKey(null)
    setDrawerTitle(
      isEdit && cust
        ? "Edit Customer Details"
        : title || (activeTab === "enquiry" ? "New Enquiry" : "New Customer")
    )
    if (isEdit && cust) {
      setEditingCustomerId(cust.id)
      setFormBasicDetails({
        businessName: cust.businessName || cust.name,
        primaryContactName: cust.contactPerson || cust.name,
        primaryContactNumber: cust.phone,
        isWhatsAppSame: cust.isWhatsAppSame ?? true,
        whatsappNumber: cust.whatsappNumber || (cust.isWhatsAppSame !== false ? cust.phone : ""),
        email: cust.email,
        followUpDate: cust.followUpDate || "",
      })
      setBillingDetails({
        billingName: cust.billingName || cust.businessName || cust.name,
        gstin: cust.gstin || "",
        billingAddress: cust.billingAddress || cust.address || "",
        billingAddressLine1: cust.billingAddressLine1 || "",
        billingAddressLine2: cust.billingAddressLine2 || "",
        city: cust.billingCity || "Chennai",
        state: cust.billingState || "Tamil Nadu",
        pincode: cust.billingPincode || "600051",
        isShippingSameAsBilling: cust.isShippingSameAsBilling !== false,
        shippingAddress: cust.shippingAddress || "",
        shippingAddressLine1: cust.shippingAddressLine1 || "",
        shippingAddressLine2: cust.shippingAddressLine2 || "",
        shippingCity: cust.shippingCity || "Chennai",
        shippingState: cust.shippingState || "Tamil Nadu",
        shippingPincode: cust.shippingPincode || "600051",
      })
      setFormSites(
        cust.sites && cust.sites.length > 0
          ? JSON.parse(JSON.stringify(cust.sites))
          : [createDefaultSite(1)]
      )
    } else {
      setEditingCustomerId(null)
      setEditingEnquiryId(null)
      setFormBasicDetails({
        businessName: "",
        primaryContactName: "",
        primaryContactNumber: "",
        isWhatsAppSame: true,
        whatsappNumber: "",
        email: "",
        followUpDate: "",
      })
      setBillingDetails({
        billingName: "",
        gstin: "",
        billingAddress: "",
        billingAddressLine1: "",
        billingAddressLine2: "",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600051",
        isShippingSameAsBilling: true,
        shippingAddress: "",
        shippingAddressLine1: "",
        shippingAddressLine2: "",
        shippingCity: "Chennai",
        shippingState: "Tamil Nadu",
        shippingPincode: "600051",
      })
      setFormSites([createDefaultSite(1)])
    }
    setActiveRightTab("services")
    setCollapsedSites(new Set())
    setIsModalOpen(true)
  }

  const openDrawerForEnquiry = React.useCallback((enq: EnquiryRecord) => {
    setFormErrors({})
    setEditingCustomerId(null)
    setEditingEnquiryId(enq.id)
    setDrawerTitle("Enquiry Details")
    setFormBasicDetails({
      businessName: enq.contactName,
      primaryContactName: enq.contactName,
      primaryContactNumber: enq.phone,
      isWhatsAppSame: true,
      whatsappNumber: enq.phone,
      email: enq.email || "",
      followUpDate: enq.followUpDate || "",
    })
    setBillingDetails({
      billingName: enq.contactName,
      gstin: "",
      billingAddress: enq.address || "",
      billingAddressLine1: enq.address || "",
      billingAddressLine2: "",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600051",
      isShippingSameAsBilling: true,
      shippingAddress: enq.address || "",
      shippingAddressLine1: enq.address || "",
      shippingAddressLine2: "",
      shippingCity: "Chennai",
      shippingState: "Tamil Nadu",
      shippingPincode: "600051",
    })
    const defaultSite = createDefaultSite(1)
    if (enq.address) {
      defaultSite.address = enq.address
    }
    if (enq.inquiryNote && defaultSite.serviceDetails?.[0]) {
      defaultSite.serviceDetails[0].signStyle = enq.inquiryNote.split(" (")[0] || enq.inquiryNote
      defaultSite.serviceDetails[0].notes = enq.inquiryNote
    }
    setFormSites([defaultSite])
    setActiveRightTab("services")
    setCollapsedSites(new Set())
    setIsModalOpen(true)
  }, [])

  const closeNewCustomerModal = () => {
    if (productDrawerReturnTitle) {
      setDrawerTitle(productDrawerReturnTitle)
      setProductDrawerReturnTitle(null)
      setQuickTargetService(null)
      return
    }
    setFormErrors({})
    setSupplierErrors({})
    setProductErrors({})
    setMaterialErrors({})
    setFinishErrors({})
    setEditingCustomerId(null)
    setEditingEnquiryId(null)
    setEditingSupplierId(null)
    setEditingProductId(null)
    setEditingMaterialId(null)
    setEditingFinishId(null)
    setDrawerAnchor(null)
    setHighlightedAnchorKey(null)
    setIsModalOpen(false)
  }

  // Follow-Up Reminder Engine (1 day before followUpDate until target date)
  const isDueForFollowUpReminder = React.useCallback((followUpDateStr?: string): boolean => {
    if (!followUpDateStr) return false

    let targetDate: Date | null = null
    const parts = followUpDateStr.trim().split("-")
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        targetDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        targetDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
      }
    }
    if (!targetDate || isNaN(targetDate.getTime())) {
      targetDate = new Date(followUpDateStr)
    }
    if (isNaN(targetDate.getTime())) return false

    targetDate.setHours(23, 59, 59, 999)

    // 1 day before at 00:00:00
    const oneDayBefore = new Date(targetDate)
    oneDayBefore.setDate(oneDayBefore.getDate() - 1)
    oneDayBefore.setHours(0, 0, 0, 0)

    const now = new Date()
    return now >= oneDayBefore && now <= targetDate
  }, [])

  const triggerFollowUpReminder = React.useCallback(
    (enq: EnquiryRecord) => {
      palNotch.notify({
        id: `followup-${enq.id}`,
        badge: "FOLLOW UP REMINDER",
        variant: "warning",
        title: `Follow up required: ${enq.contactName}`,
        description: `Follow-up scheduled on ${enq.followUpDate || "today"}. Contact phone: ${enq.phone}`,
        customerCard: {
          name: enq.contactName,
          phone: enq.phone,
          email: enq.email,
        },
        duration: 25000,
        action: {
          label: "View customer",
          onClick: () => {
            openDrawerForEnquiry(enq)
          },
        },
      })
    },
    [openDrawerForEnquiry]
  )

  const remindedEnquiriesRef = React.useRef<Set<string>>(new Set())
  React.useEffect(() => {
    if (enquiries.length === 0) return

    for (const enq of enquiries) {
      if (enq.followUpDate && isDueForFollowUpReminder(enq.followUpDate)) {
        if (!remindedEnquiriesRef.current.has(enq.id)) {
          remindedEnquiriesRef.current.add(enq.id)
          triggerFollowUpReminder(enq)
          break
        }
      }
    }
  }, [enquiries, isDueForFollowUpReminder, triggerFollowUpReminder])

  // Stable memoized callbacks for 120 FPS table rows
  const handleEditCustomer = React.useCallback((cust: CustomerRecord) => {
    openDrawer(true, cust)
  }, [])

  const handleDeleteCustomer = React.useCallback(
    (id: string, name: string) => {
      palNotch.confirm({
        badge: "DELETE CUSTOMER",
        title: `Delete Customer "${name}"?`,
        description: "This will permanently remove this customer and their contact records.",
        confirmText: "Delete Customer",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("customer", id, name),
      })
    },
    [executeDelete]
  )

  const handleViewSites = React.useCallback((cust: CustomerRecord) => {
    setSelectedCustomerForSites(cust)
  }, [])

  const handleEditEnquiry = React.useCallback((enq: EnquiryRecord) => {
    openDrawerForEnquiry(enq)
  }, [])

  const handleDeleteEnquiry = React.useCallback(
    (id: string, name: string) => {
      palNotch.confirm({
        badge: "DELETE ENQUIRY",
        title: `Delete Enquiry "${name}"?`,
        description: "This action cannot be undone and will permanently remove this enquiry.",
        confirmText: "Delete Enquiry",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("enquiry", id, name),
      })
    },
    [executeDelete]
  )

  const handleRenegotiateQuotation = React.useCallback(
    (q: QuotationListItem) => {
      const versionInfo = getNextQuoteVersion(q.quoteNumber);

      // 1. Locate the exact customer from customer panel / state
      const customerToUse: CustomerRecord = customers.find(
        (c) =>
          (q.customerId && c.id === q.customerId) ||
          c.name.trim().toLowerCase() === q.customerName.trim().toLowerCase() ||
          (c.businessName && c.businessName.trim().toLowerCase() === q.customerName.trim().toLowerCase()) ||
          (q.phone && c.phone && c.phone.replace(/\D/g, "") === q.phone.replace(/\D/g, ""))
      ) || {
        id: q.customerId || `cust-reneg-${Date.now()}`,
        name: q.customerName,
        businessName: q.customerName,
        contactPerson: q.contactPerson || q.customerName,
        phone: q.phone || "",
        email: "",
        address: q.sitesJson?.[0]?.address || "Installation Site",
        customerType: "RETAIL_BRAND",
        createdAt: new Date().toISOString(),
        sites: [],
      };

      // 2. Prepare sites and product line items from quote or customer sites
      let quoteSites: QuoteSite[] = [];
      if (q.sitesJson && q.sitesJson.length > 0) {
        quoteSites = q.sitesJson.map((s: any, sIdx: number) => ({
          id: s.id || `site-${sIdx + 1}`,
          siteName: s.siteName || s.site_name || `Site ${sIdx + 1}`,
          address: s.address || "",
          isExpanded: true,
          items: (s.items || []).map((it: any, iIdx: number) => {
            const methodCode = it.methodCode || it.method_code || "sq_ft";
            const methodName = it.methodName || it.method_name || "Square Feet";
            const rateLabel = it.rateLabel || it.rate_label || "per sq ft";
            const qty = it.quantity || it.qty || 1;
            const rate = it.rate != null ? Number(it.rate) : (it.price != null ? Number(it.price) : null);
            const discount = it.discount != null ? Number(it.discount) : (it.discountPct != null ? Number(it.discountPct) : 0);
            const width = it.width != null ? it.width : "";
            const height = it.height != null ? it.height : "";
            const total = it.total != null ? Number(it.total) : null;

            return {
              id: it.id || `item-${sIdx + 1}-${iIdx + 1}`,
              productTitle: it.productTitle || it.product_title || "Signage Product",
              materialName: it.materialName || it.material_name || "",
              finishName: it.finishName || it.finish_name || "",
              methodCode,
              methodName,
              method: methodName,
              rateLabel,
              size: width && height ? `${width} × ${height}` : "",
              width,
              height,
              qty,
              quantity: qty,
              price: rate,
              rate,
              discount,
              discountPct: discount,
              billableQty: it.billableQty || it.billable_qty || null,
              total,
              status: "ok" as const,
            };
          }),
        }));
      } else if (customerToUse.sites && customerToUse.sites.length > 0) {
        quoteSites = customerToUse.sites.map((s, sIdx) => ({
          id: s.id || `site-${sIdx + 1}`,
          siteName: s.siteName || `Site ${sIdx + 1}`,
          address: s.address || "",
          isExpanded: true,
          items: (s.serviceDetails && s.serviceDetails.length > 0)
            ? s.serviceDetails.map((srv: any, iIdx: number) => ({
              id: srv.id || `item-${sIdx + 1}-${iIdx + 1}`,
              productTitle: srv.signStyle || srv.productTitle || "Signage Service",
              materialName: srv.material || "",
              finishName: srv.finishing || "",
              methodCode: (srv.unit === "m" ? "sq_m" : "sq_ft") as any,
              methodName: srv.unit === "m" ? "Metre square" : "Square Feet",
              method: srv.unit === "m" ? "Metre square" : "Square Feet",
              rateLabel: srv.unit === "m" ? "per sq m" : "per sq ft",
              size: `${srv.width || 8} × ${srv.height || 2}`,
              width: srv.width || 8,
              height: srv.height || 2,
              qty: srv.quantity || 1,
              quantity: srv.quantity || 1,
              price: null,
              rate: null,
              discount: 0,
              discountPct: 0,
              billableQty: null,
              total: null,
              status: "incomplete" as const,
            }))
            : [],
        }));
      }

      const renegData: RenegotiatingQuoteData = {
        originalQuoteNumber: q.quoteNumber,
        quoteNumber: versionInfo.nextQuoteNumber,
        versionNumber: versionInfo.versionNumber,
        versionLabel: versionInfo.versionLabel,
        customer: customerToUse,
        sites: quoteSites,
        subtotal: q.sitesSubtotal,
        transportCost: q.transportCost,
        designCharges: q.designCharges,
        installationCharges: q.installationCharges,
        discountPercent: q.discountPercent,
        gstRate: q.gstRate,
        fabNotes: q.fabNotes,
        commercialTerms: q.commercialTerms,
      };

      palNotch.notify({
        badge: "QUOTATION REVISION",
        variant: "info",
        title: `Quotation Revision (${versionInfo.versionLabel}) Auto-Populated`,
        description: `For ${q.customerName}, quotation revision (${versionInfo.versionLabel}) is auto-populated in the billing screen. A newer version of this quotation is being created for renegotiation.`,
        customerCard: {
          name: q.customerName,
          contactPerson: q.contactPerson,
          phone: q.phone,
        },
        duration: 9000,
      });

      setRenegotiatingQuote(renegData);
      setQuotationSelectedCustomer(customerToUse);
      setActiveModule("quotation");
    },
    [customers]
  )

  const handleEditSupplier = React.useCallback((supp: SupplierRecord) => {
    openDrawerForSupplier(supp)
  }, [])

  const handleDeleteSupplier = React.useCallback(
    (id: string, name: string) => {
      palNotch.confirm({
        badge: "DELETE SUPPLIER",
        title: `Delete Supplier "${name}"?`,
        description: "This action cannot be undone and will permanently remove this supplier record.",
        confirmText: "Delete Supplier",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("supplier", id, name),
      })
    },
    [executeDelete]
  )

  const handleEditProduct = React.useCallback((prod: ProductRecord) => {
    openDrawerForProduct(prod)
  }, [])

  const handleDeleteProduct = React.useCallback(
    (id: string, name: string) => {
      palNotch.confirm({
        badge: "DELETE PRODUCT",
        title: `Delete Product "${name}"?`,
        description: "This will permanently remove this product from your workshop catalog.",
        confirmText: "Delete Product",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("product", id, name),
      })
    },
    [executeDelete]
  )

  const handleSaveMaterialWithName = React.useCallback(
    async (
      name: string,
      targetMat?: MaterialRecord | null,
      targetService?: { siteIdx: number; srvIdx: number } | null
    ) => {
      const trimmed = name.trim()
      if (!trimmed) {
        throw new Error("Empty name")
      }
      if (targetMat) {
        const updated: MaterialRecord = {
          ...targetMat,
          name: trimmed,
        }
        try {
          await leadsService.saveMaterial(updated)
          setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
          showToast(`Material "${trimmed}" updated successfully`, "success")
        } catch (err) {
          showToast("Failed to update material", "error")
          throw err
        }
        return
      }
      const newMat: MaterialRecord = {
        id: `mat-${Date.now()}`,
        name: trimmed,
        category: "Custom Substrates",
        createdAt: new Date().toISOString(),
      }
      try {
        await leadsService.saveMaterial(newMat)
        setMaterials((prev) => [newMat, ...prev])
        if (isModalOpen && drawerTitle.includes("Product")) {
          setProductForm((prev) => ({
            ...prev,
            materialIds: [...prev.materialIds, newMat.id],
          }))
        }
        const activeTargetService = targetService || quickTargetService
        if (activeTargetService) {
          const { siteIdx, srvIdx } = activeTargetService
          const updated = [...formSites]
          const srvs = [...(updated[siteIdx]?.serviceDetails || [])]
          if (srvs[srvIdx]) {
            srvs[srvIdx] = {
              ...srvs[srvIdx],
              material: newMat.name,
            }
            updated[siteIdx] = { ...updated[siteIdx], serviceDetails: srvs }
            setFormSites(updated)

            const curStyle = srvs[srvIdx].signStyle
            if (curStyle) {
              const matchedProd = products.find((p) => p.title.toLowerCase() === curStyle.toLowerCase())
              if (matchedProd && !matchedProd.materialIds?.includes(newMat.id)) {
                const updatedProd: ProductRecord = {
                  ...matchedProd,
                  materialIds: [...(matchedProd.materialIds || []), newMat.id],
                }
                leadsService.saveProduct(updatedProd).catch(() => { })
                setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)))
              }
            }
          }
          setQuickTargetService(null)
        }
        showToast(`Material "${newMat.name}" created successfully`, "success")
      } catch (err) {
        showToast("Failed to save material", "error")
        throw err
      }
    },
    [isModalOpen, drawerTitle, quickTargetService, formSites, products, showToast]
  )

  const handleSaveFinishWithName = React.useCallback(
    async (
      name: string,
      targetFin?: FinishRecord | null,
      targetService?: { siteIdx: number; srvIdx: number } | null
    ) => {
      const trimmed = name.trim()
      if (!trimmed) {
        throw new Error("Empty name")
      }
      if (targetFin) {
        const updated: FinishRecord = {
          ...targetFin,
          name: trimmed,
        }
        try {
          await leadsService.saveFinish(updated)
          setFinishes((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
          showToast(`Finish "${trimmed}" updated successfully`, "success")
        } catch (err) {
          showToast("Failed to update finish", "error")
          throw err
        }
        return
      }
      const newFin: FinishRecord = {
        id: `fin-${Date.now()}`,
        name: trimmed,
        type: "Custom Finish",
        createdAt: new Date().toISOString(),
      }
      try {
        await leadsService.saveFinish(newFin)
        setFinishes((prev) => [newFin, ...prev])
        if (isModalOpen && drawerTitle.includes("Product")) {
          setProductForm((prev) => ({
            ...prev,
            finishIds: [...prev.finishIds, newFin.id],
          }))
        }
        const activeTargetService = targetService || quickTargetService
        if (activeTargetService) {
          const { siteIdx, srvIdx } = activeTargetService
          const updated = [...formSites]
          const srvs = [...(updated[siteIdx]?.serviceDetails || [])]
          if (srvs[srvIdx]) {
            srvs[srvIdx] = {
              ...srvs[srvIdx],
              finishing: newFin.name,
            }
            updated[siteIdx] = { ...updated[siteIdx], serviceDetails: srvs }
            setFormSites(updated)

            const curStyle = srvs[srvIdx].signStyle
            if (curStyle) {
              const matchedProd = products.find((p) => p.title.toLowerCase() === curStyle.toLowerCase())
              if (matchedProd && !matchedProd.finishIds?.includes(newFin.id)) {
                const updatedProd: ProductRecord = {
                  ...matchedProd,
                  finishIds: [...(matchedProd.finishIds || []), newFin.id],
                }
                leadsService.saveProduct(updatedProd).catch(() => { })
                setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)))
              }
            }
          }
          setQuickTargetService(null)
        }
        showToast(`Finish "${newFin.name}" created successfully`, "success")
      } catch (err) {
        showToast("Failed to save finish", "error")
        throw err
      }
    },
    [isModalOpen, drawerTitle, quickTargetService, formSites, products, showToast]
  )

  const openMaterialPrompt = React.useCallback(
    (mat?: MaterialRecord | null, targetService?: { siteIdx: number; srvIdx: number } | null) => {
      const isEdit = Boolean(mat)
      palNotch.prompt({
        title: isEdit ? "Edit Material" : "Add New Material",
        description: isEdit
          ? "Update the raw material or substrate name in your master catalog."
          : "Enter the substrate or raw material name. It will be added to your master materials catalog.",
        inputLabel: "Material Name",
        inputPlaceholder: "e.g. Acrylic Sheet",
        defaultValue: mat?.name || "",
        submitText: isEdit ? "Save Changes" : "Save Material",
        cancelText: "Cancel",
        badge: isEdit ? "EDIT MATERIAL" : "NEW MATERIAL",
        icon: isEdit ? "edit" : "material",
        variant: "brand",
        errorMessage: "Please enter a material name",
        onSubmit: async (name) => {
          await handleSaveMaterialWithName(name, mat || null, targetService || null)
        },
      })
    },
    [handleSaveMaterialWithName]
  )

  const openFinishPrompt = React.useCallback(
    (fin?: FinishRecord | null, targetService?: { siteIdx: number; srvIdx: number } | null) => {
      const isEdit = Boolean(fin)
      palNotch.prompt({
        title: isEdit ? "Edit Finish" : "Add New Finish",
        description: isEdit
          ? "Update the coating or finishing treatment name in your master catalog."
          : "Enter the coating, treatment, or finishing process name. It will be added to your master finishes catalog.",
        inputLabel: "Finish Name",
        inputPlaceholder: "e.g. Powder Coating",
        defaultValue: fin?.name || "",
        submitText: isEdit ? "Save Changes" : "Save Finish",
        cancelText: "Cancel",
        badge: isEdit ? "EDIT FINISH" : "NEW FINISH",
        icon: isEdit ? "edit" : "finish",
        variant: "brand",
        errorMessage: "Please enter a finish name",
        onSubmit: async (name) => {
          await handleSaveFinishWithName(name, fin || null, targetService || null)
        },
      })
    },
    [handleSaveFinishWithName]
  )

  const handleEditMaterial = React.useCallback(
    (mat: MaterialRecord) => {
      openMaterialPrompt(mat)
    },
    [openMaterialPrompt]
  )

  const handleDeleteMaterial = React.useCallback(
    (id: string, name: string) => {
      palNotch.confirm({
        badge: "DELETE MATERIAL",
        title: `Delete Material "${name}"?`,
        description: "This will permanently remove this raw material and gauge specs from inventory.",
        confirmText: "Delete Material",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("material", id, name),
      })
    },
    [executeDelete]
  )

  const handleEditFinish = React.useCallback(
    (fin: FinishRecord) => {
      openFinishPrompt(fin)
    },
    [openFinishPrompt]
  )

  const handleDeleteFinish = React.useCallback(
    (id: string, name: string) => {
      palNotch.confirm({
        badge: "DELETE FINISH",
        title: `Delete Finish "${name}"?`,
        description: "This will permanently remove this powder/anodizing finish from your catalog.",
        confirmText: "Delete Finish",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("finish", id, name),
      })
    },
    [executeDelete]
  )

  const handleDeleteTax = React.useCallback(
    (tax: TaxRecord) => {
      palNotch.confirm({
        badge: "DELETE TAX",
        title: `Delete Tax "${tax.name}"?`,
        description: "This will permanently remove this tax rate.",
        confirmText: "Delete Tax",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("tax", tax.id, tax.name),
      })
    },
    [executeDelete]
  )

  const openDrawerForSupplier = (supplier?: SupplierRecord) => {
    setFormErrors({})
    setSupplierErrors({})
    setEditingCustomerId(null)
    if (supplier) {
      setDrawerTitle("Edit Supplier Details")
      setEditingSupplierId(supplier.id)
      setSupplierForm({
        supplierName: supplier.supplierName,
        contactPerson: supplier.contactPerson || "",
        phone: supplier.phone,
        email: supplier.email || "",
        isWhatsAppSame: supplier.isWhatsAppSame !== false,
        whatsappNumber: supplier.whatsappNumber || supplier.phone,
        category: supplier.category,
        gstin: supplier.gstin || "",
        address: supplier.address || "",
        addressLine1: supplier.addressLine1 || (supplier.address ? supplier.address.split(", ")[0] || "" : ""),
        addressLine2: supplier.addressLine2 || (supplier.address && supplier.address.includes(", ") ? supplier.address.split(", ").slice(1).join(", ") : ""),
        city: supplier.city || "Chennai",
        state: supplier.state || "Tamil Nadu",
        pincode: supplier.pincode || "600032",
        servingRegions: supplier.servingRegions || "Greater Chennai, Kanchipuram, Chengalpattu",
        isBillingSameAsWarehouse: supplier.isBillingSameAsWarehouse !== false,
        billingAddress: supplier.billingAddress || supplier.address || "",
        billingAddressLine1: supplier.billingAddressLine1 || "",
        billingAddressLine2: supplier.billingAddressLine2 || "",
        billingCity: supplier.billingCity || supplier.city || "Chennai",
        billingState: supplier.billingState || supplier.state || "Tamil Nadu",
        billingPincode: supplier.billingPincode || supplier.pincode || "600032",
        isShippingSameAsBilling: supplier.isShippingSameAsBilling !== false,
        shippingAddress: supplier.shippingAddress || supplier.billingAddress || supplier.address || "PrintPal Workshop & Factory, No. 8 Industrial Estate, Guindy, Chennai 600032",
        shippingAddressLine1: supplier.shippingAddressLine1 || "No. 8 Industrial Estate",
        shippingAddressLine2: supplier.shippingAddressLine2 || "Guindy",
        shippingCity: supplier.shippingCity || "Chennai",
        shippingState: supplier.shippingState || "Tamil Nadu",
        shippingPincode: supplier.shippingPincode || "600032",
        deliveryLeadTime: supplier.deliveryLeadTime || "Same Day (2-4 hrs)",
        minOrderQty: supplier.minOrderQty || "1 sheet / 1 pc",
        paymentTerms: supplier.paymentTerms || "ADVANCE",
        notes: supplier.notes || "",
      })
    } else {
      setDrawerTitle("New Supplier")
      setEditingSupplierId(null)
      setSupplierForm({
        supplierName: "",
        contactPerson: "",
        phone: "",
        email: "",
        isWhatsAppSame: true,
        whatsappNumber: "",
        category: "",
        gstin: "",
        address: "",
        addressLine1: "",
        addressLine2: "",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600032",
        servingRegions: "Greater Chennai (All Industrial Zones)",
        isBillingSameAsWarehouse: true,
        billingAddress: "",
        billingAddressLine1: "",
        billingAddressLine2: "",
        billingCity: "Chennai",
        billingState: "Tamil Nadu",
        billingPincode: "600032",
        isShippingSameAsBilling: true,
        shippingAddress: "PrintPal Workshop & Factory, No. 8 Industrial Estate, Guindy, Chennai 600032",
        shippingAddressLine1: "No. 8 Industrial Estate",
        shippingAddressLine2: "Guindy",
        shippingCity: "Chennai",
        shippingState: "Tamil Nadu",
        shippingPincode: "600032",
        deliveryLeadTime: "Same Day (2-4 hrs)",
        minOrderQty: "1 sheet / 1 pc",
        paymentTerms: "ADVANCE",
        notes: "",
      })
    }
    setServicesSearchQuery("")
    setLocationsSearchQuery("")
    setIsModalOpen(true)
  }

  const handleSaveSupplier = async () => {
    const errors: Record<string, string> = {}
    if (!supplierForm.supplierName.trim()) {
      errors.supplierName = "Company / Business name is required"
    }
    if (!supplierForm.phone.trim()) {
      errors.phone = "Supplier contact number is required"
    }
    if (!supplierForm.category.trim()) {
      errors.category = "Please enter or select what they supply"
    }
    if (!supplierForm.addressLine1.trim() && !supplierForm.address.trim()) {
      errors.addressLine1 = "Address Line 1 is required"
    }

    if (Object.keys(errors).length > 0) {
      setSupplierErrors(errors)
      return
    }

    const combinedAddress = [supplierForm.addressLine1.trim(), supplierForm.addressLine2.trim()].filter(Boolean).join(", ") || supplierForm.address.trim()
    const combinedBillingAddress = [supplierForm.billingAddressLine1.trim(), supplierForm.billingAddressLine2.trim(), supplierForm.billingCity.trim(), supplierForm.billingState.trim(), supplierForm.billingPincode.trim()].filter(Boolean).join(", ") || supplierForm.billingAddress.trim()
    const combinedShippingAddress = [supplierForm.shippingAddressLine1.trim(), supplierForm.shippingAddressLine2.trim(), supplierForm.shippingCity.trim(), supplierForm.shippingState.trim(), supplierForm.shippingPincode.trim()].filter(Boolean).join(", ") || supplierForm.shippingAddress.trim()

    const supplierPayload: SupplierRecord = {
      id: editingSupplierId || `supp-${Date.now()}`,
      supplierName: supplierForm.supplierName.trim(),
      contactPerson: supplierForm.contactPerson.trim() || undefined,
      phone: supplierForm.phone.trim(),
      email: supplierForm.email.trim() || undefined,
      isWhatsAppSame: supplierForm.isWhatsAppSame,
      whatsappNumber: supplierForm.isWhatsAppSame ? supplierForm.phone.trim() : (supplierForm.whatsappNumber.trim() || undefined),
      category: supplierForm.category.trim(),
      gstin: supplierForm.gstin.trim() || undefined,
      address: combinedAddress || undefined,
      addressLine1: supplierForm.addressLine1.trim() || undefined,
      addressLine2: supplierForm.addressLine2.trim() || undefined,
      city: supplierForm.city.trim() || undefined,
      state: supplierForm.state.trim() || undefined,
      pincode: supplierForm.pincode.trim() || undefined,
      servingRegions: supplierForm.servingRegions?.trim() || undefined,
      isBillingSameAsWarehouse: supplierForm.isBillingSameAsWarehouse,
      billingAddress: supplierForm.isBillingSameAsWarehouse ? (combinedAddress || undefined) : (combinedBillingAddress || undefined),
      billingAddressLine1: supplierForm.isBillingSameAsWarehouse ? supplierForm.addressLine1 : (supplierForm.billingAddressLine1.trim() || undefined),
      billingAddressLine2: supplierForm.isBillingSameAsWarehouse ? supplierForm.addressLine2 : (supplierForm.billingAddressLine2.trim() || undefined),
      billingCity: supplierForm.isBillingSameAsWarehouse ? supplierForm.city : (supplierForm.billingCity.trim() || undefined),
      billingState: supplierForm.isBillingSameAsWarehouse ? supplierForm.state : (supplierForm.billingState.trim() || undefined),
      billingPincode: supplierForm.isBillingSameAsWarehouse ? supplierForm.pincode : (supplierForm.billingPincode.trim() || undefined),
      isShippingSameAsBilling: supplierForm.isShippingSameAsBilling,
      shippingAddress: supplierForm.isShippingSameAsBilling
        ? (supplierForm.isBillingSameAsWarehouse ? combinedAddress : combinedBillingAddress || "PrintPal Workshop & Factory, No. 8 Industrial Estate, Guindy, Chennai 600032")
        : (combinedShippingAddress || undefined),
      shippingAddressLine1: supplierForm.isShippingSameAsBilling ? undefined : (supplierForm.shippingAddressLine1.trim() || undefined),
      shippingAddressLine2: supplierForm.isShippingSameAsBilling ? undefined : (supplierForm.shippingAddressLine2.trim() || undefined),
      shippingCity: supplierForm.isShippingSameAsBilling ? undefined : (supplierForm.shippingCity.trim() || undefined),
      shippingState: supplierForm.isShippingSameAsBilling ? undefined : (supplierForm.shippingState.trim() || undefined),
      shippingPincode: supplierForm.isShippingSameAsBilling ? undefined : (supplierForm.shippingPincode.trim() || undefined),
      deliveryLeadTime: supplierForm.deliveryLeadTime || undefined,
      minOrderQty: supplierForm.minOrderQty?.trim() || undefined,
      paymentTerms: supplierForm.paymentTerms || "ADVANCE",
      notes: supplierForm.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    await leadsService.saveSupplier(supplierPayload)

    if (editingSupplierId) {
      setSuppliers((prev) => prev.map((s) => (s.id === editingSupplierId ? supplierPayload : s)))
      showToast(`Supplier "${supplierPayload.supplierName}" updated successfully`, "success")
    } else {
      setSuppliers((prev) => [supplierPayload, ...prev])
      showToast(`Supplier "${supplierPayload.supplierName}" created successfully`, "success")
    }

    closeNewCustomerModal()
  }

  const openDrawerForProduct = (product?: ProductRecord) => {
    setFormErrors({})
    setSupplierErrors({})
    setProductErrors({})
    setEditingCustomerId(null)
    setEditingSupplierId(null)
    setEditingMaterialId(null)
    setEditingFinishId(null)
    setMaterialsSearchInDrawer("")
    setFinishesSearchInDrawer("")

    if (product) {
      setDrawerTitle("Edit Product Details")
      setEditingProductId(product.id)
      setProductForm({
        title: product.title || "",
        category: product.category || "Channel Letters",
        description: product.description || "",
        pricedPer: (product.pricedPer || "Per letter") as "Per letter" | "Per sq ft" | "Per inch" | "Per running ft" | "Per piece" | "Lump sum",
        materialIds: product.materialIds || [],
        finishIds: product.finishIds || [],
        isActive: product.isActive !== false,
        width: product.width || "1200",
        height: product.height || "600",
        unit: product.unit || "mm",
        returnDepth: "75mm",
        minStroke: "15mm",
        material: "",
        finishing: "",
        colour: "",
        application: (product.application || "Outdoor") as "Indoor" | "Outdoor" | "Coastal",
        productionType: (product.productionType || "INTERNAL") as "INTERNAL" | "OUTSOURCE" | "HYBRID",
        illumination: "Samsung 12V 6500K IP67 LED Modules",
        mounting: "Flush Stud Mount with Acrylic Standoffs",
        leadTime: "3-5 Working Days",
        notes: product.notes || "",
      })
    } else {
      setDrawerTitle("New Product")
      setEditingProductId(null)
      setProductForm({
        title: "",
        category: "Channel Letters",
        description: "",
        pricedPer: "Per letter",
        materialIds: ["M01", "M03"],
        finishIds: ["F01", "F02"],
        isActive: true,
        width: "1200",
        height: "600",
        unit: "mm",
        returnDepth: "75mm",
        minStroke: "15mm",
        material: "",
        finishing: "",
        colour: "",
        application: "Outdoor",
        productionType: "INTERNAL",
        illumination: "Samsung 12V 6500K IP67 LED Modules",
        mounting: "Flush Stud Mount with Acrylic Standoffs",
        leadTime: "3-5 Working Days",
        notes: "",
      })
    }
    setIsModalOpen(true)
  }

  const handleSaveProduct = async () => {
    const errors: Record<string, string> = {}
    if (!productForm.title.trim()) {
      errors.title = "Product name is required"
    }
    if (Object.keys(errors).length > 0) {
      setProductErrors(errors)
      return
    }

    const newProd: ProductRecord = {
      id: editingProductId || `prod-${Date.now()}`,
      title: productForm.title.trim(),
      category: productForm.category,
      description: productForm.description.trim(),
      pricedPer: productForm.pricedPer,
      materialIds: productForm.materialIds,
      finishIds: productForm.finishIds,
      isActive: productForm.isActive,
      width: productForm.width,
      height: productForm.height,
      unit: productForm.unit,
      notes: productForm.notes,
      createdAt: new Date().toISOString(),
    }

    try {
      await leadsService.saveProduct(newProd)
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === newProd.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = newProd
          return next
        }
        return [newProd, ...prev]
      })
      showToast(
        editingProductId ? `Product "${newProd.title}" updated successfully` : `Product "${newProd.title}" created successfully`,
        "success"
      )
      if (productDrawerReturnTitle) {
        if (quickTargetService) {
          const { siteIdx, srvIdx } = quickTargetService
          const updated = [...formSites]
          const srvs = [...(updated[siteIdx]?.serviceDetails || [])]
          if (srvs[srvIdx]) {
            const firstMat = materials.find((m) => newProd.materialIds?.includes(m.id))?.name || srvs[srvIdx].material || ""
            const firstFin = finishes.find((f) => newProd.finishIds?.includes(f.id))?.name || srvs[srvIdx].finishing || ""
            srvs[srvIdx] = {
              ...srvs[srvIdx],
              signStyle: newProd.title,
              material: firstMat,
              finishing: firstFin,
            }
            updated[siteIdx] = { ...updated[siteIdx], serviceDetails: srvs }
            setFormSites(updated)
          }
        }
        setDrawerTitle(productDrawerReturnTitle)
        setProductDrawerReturnTitle(null)
        setQuickTargetService(null)
        return
      }
      closeNewCustomerModal()
    } catch (err) {
      showToast("Failed to save product", "error")
    }
  }

  const handleSaveQuickProduct = async () => {
    const trimmed = quickProductName.trim()
    if (!trimmed) {
      setQuickProductError("Product name is required")
      return
    }
    setQuickProductError(null)
    const newProd: ProductRecord = {
      id: `prod-${Date.now()}`,
      title: trimmed,
      description: quickProductDesc.trim(),
      materialIds: quickProductSelectedMats,
      finishIds: quickProductSelectedFins,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    try {
      await leadsService.saveProduct(newProd)
      setProducts((prev) => [newProd, ...prev])
      showToast(`Product "${newProd.title}" created successfully`, "success")

      if (quickTargetService) {
        const { siteIdx, srvIdx } = quickTargetService
        const updated = [...formSites]
        const srvs = [...(updated[siteIdx]?.serviceDetails || [])]
        if (srvs[srvIdx]) {
          const firstMat = materials.find((m) => newProd.materialIds?.includes(m.id))?.name || ""
          const firstFin = finishes.find((f) => newProd.finishIds?.includes(f.id))?.name || ""
          srvs[srvIdx] = {
            ...srvs[srvIdx],
            signStyle: newProd.title,
            material: firstMat,
            finishing: firstFin,
          }
          updated[siteIdx] = { ...updated[siteIdx], serviceDetails: srvs }
          setFormSites(updated)
        }
      }

      setIsQuickProductModalOpen(false)
      setQuickProductName("")
      setQuickProductDesc("")
      setQuickProductSelectedMats([])
      setQuickProductSelectedFins([])
      setQuickTargetService(null)
    } catch (err) {
      showToast("Failed to save product", "error")
    }
  }

  const openDrawerForMaterial = (material?: MaterialRecord) => {
    setFormErrors({})
    setSupplierErrors({})
    setProductErrors({})
    setMaterialErrors({})
    setFinishErrors({})
    setEditingCustomerId(null)
    setEditingSupplierId(null)
    setEditingProductId(null)
    setEditingFinishId(null)
    if (material) {
      setDrawerTitle("Edit Material Details")
      setEditingMaterialId(material.id)
      setMaterialForm({
        name: material.name,
        category: material.category || "Acrylic & Diffusers",
        thickness: material.thickness || "3mm",
        standardSize: material.standardSize || "8 × 4 ft Sheet",
        application: (material.application || "Outdoor") as "Indoor" | "Outdoor" | "Coastal",
        supplierName: material.supplierName || "",
        notes: material.notes || "",
      })
    } else {
      setDrawerTitle("New Material")
      setEditingMaterialId(null)
      setMaterialForm({
        name: "",
        category: "Acrylic & Diffusers",
        thickness: "3mm",
        standardSize: "8 × 4 ft Sheet",
        application: "Outdoor",
        supplierName: "",
        notes: "",
      })
    }
    setIsModalOpen(true)
  }

  const handleSaveMaterial = async () => {
    const errors: Record<string, string> = {}
    if (!materialForm.name.trim()) {
      errors.name = "Material name is required"
    }
    if (Object.keys(errors).length > 0) {
      setMaterialErrors(errors)
      return
    }

    const newMat: MaterialRecord = {
      id: editingMaterialId || `mat-${Date.now()}`,
      name: materialForm.name.trim(),
      category: materialForm.category,
      thickness: materialForm.thickness.trim(),
      standardSize: materialForm.standardSize.trim(),
      application: materialForm.application,
      supplierName: materialForm.supplierName.trim(),
      notes: materialForm.notes.trim(),
      createdAt: new Date().toISOString(),
    }

    try {
      await leadsService.saveMaterial(newMat)
      setMaterials((prev) => {
        const idx = prev.findIndex((m) => m.id === newMat.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = newMat
          return next
        }
        return [newMat, ...prev]
      })
      showToast(
        editingMaterialId ? `Material "${newMat.name}" updated successfully` : `Material "${newMat.name}" created successfully`,
        "success"
      )
      closeNewCustomerModal()
    } catch (err) {
      showToast("Failed to save material", "error")
    }
  }

  const openDrawerForFinish = (finish?: FinishRecord) => {
    setFormErrors({})
    setSupplierErrors({})
    setProductErrors({})
    setMaterialErrors({})
    setFinishErrors({})
    setEditingCustomerId(null)
    setEditingSupplierId(null)
    setEditingProductId(null)
    setEditingMaterialId(null)
    if (finish) {
      setDrawerTitle("Edit Finish Details")
      setEditingFinishId(finish.id)
      setFinishForm({
        name: finish.name,
        type: finish.type || "Powder Coating",
        colorCode: finish.colorCode || "RAL 9016 (Pure White)",
        application: (finish.application || "Outdoor") as "Indoor" | "Outdoor" | "Coastal",
        notes: finish.notes || "",
      })
    } else {
      setDrawerTitle("New Finish")
      setEditingFinishId(null)
      setFinishForm({
        name: "",
        type: "Powder Coating",
        colorCode: "RAL 9016 (Pure White)",
        application: "Outdoor",
        notes: "",
      })
    }
    setIsModalOpen(true)
  }

  const handleSaveFinish = async () => {
    const errors: Record<string, string> = {}
    if (!finishForm.name.trim()) {
      errors.name = "Finish name is required"
    }
    if (Object.keys(errors).length > 0) {
      setFinishErrors(errors)
      return
    }

    const newFin: FinishRecord = {
      id: editingFinishId || `fin-${Date.now()}`,
      name: finishForm.name.trim(),
      type: finishForm.type,
      colorCode: finishForm.colorCode.trim(),
      application: finishForm.application,
      notes: finishForm.notes.trim(),
      createdAt: new Date().toISOString(),
    }

    try {
      await leadsService.saveFinish(newFin)
      setFinishes((prev) => {
        const idx = prev.findIndex((f) => f.id === newFin.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = newFin
          return next
        }
        return [newFin, ...prev]
      })
      showToast(
        editingFinishId ? `Finish "${newFin.name}" updated successfully` : `Finish "${newFin.name}" created successfully`,
        "success"
      )
      closeNewCustomerModal()
    } catch (err) {
      showToast("Failed to save finish", "error")
    }
  }

  // Preserve drawer functions for comprehensive spec editing if needed
  void openDrawerForMaterial
  void openDrawerForFinish

  // Multi-select helpers for Supplier Drawer
  const selectedServices = React.useMemo(() => {
    return supplierForm.category
      ? supplierForm.category.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  }, [supplierForm.category])

  const toggleService = (service: string) => {
    const current = selectedServices
    let updated: string[]
    if (current.includes(service)) {
      updated = current.filter((s) => s !== service)
    } else {
      updated = [...current, service]
    }
    setSupplierForm((prev) => ({ ...prev, category: updated.join(", ") }))
    if (supplierErrors.category) {
      setSupplierErrors((prev) => {
        const next = { ...prev }
        delete next.category
        return next
      })
    }
  }

  const selectedLocations = React.useMemo(() => {
    return supplierForm.servingRegions
      ? supplierForm.servingRegions.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  }, [supplierForm.servingRegions])

  const toggleLocation = (location: string) => {
    const current = selectedLocations
    let updated: string[]
    if (current.includes(location)) {
      updated = current.filter((s) => s !== location)
    } else {
      updated = [...current, location]
    }
    setSupplierForm((prev) => ({ ...prev, servingRegions: updated.join(", ") }))
  }

  const filteredServices = React.useMemo(() => {
    if (!servicesSearchQuery.trim()) return SIGNAGE_SERVICES_OPTIONS
    return SIGNAGE_SERVICES_OPTIONS.filter((s) =>
      s.toLowerCase().includes(servicesSearchQuery.toLowerCase())
    )
  }, [servicesSearchQuery])

  const filteredLocations = React.useMemo(() => {
    if (!locationsSearchQuery.trim()) return DEFAULT_LOCATIONS_OPTIONS
    return DEFAULT_LOCATIONS_OPTIONS.filter((l) =>
      l.toLowerCase().includes(locationsSearchQuery.toLowerCase())
    )
  }, [locationsSearchQuery])

  const handleSaveCustomer = async () => {
    const val = validateCustomerForm(formBasicDetails, formSites, billingDetails)
    if (!val.isValid) {
      setFormErrors(val.errors)
      if (val.firstErrorTab) {
        setActiveRightTab(val.firstErrorTab)
      }
      return
    }

    setFormErrors({})

    const businessName = formBasicDetails.businessName.trim()
    const contactName = formBasicDetails.primaryContactName.trim()
    const displayName = contactName || businessName
    const phone = formBasicDetails.primaryContactNumber.trim()
    const email = formBasicDetails.email.trim()
    const firstSite = formSites[0]
    const siteAddr =
      firstSite?.address?.trim() ||
      [firstSite?.addressLine1, firstSite?.city, firstSite?.state, firstSite?.pincode]
        .filter(Boolean)
        .join(", ") ||
      billingDetails.billingAddress?.trim() ||
      "Local Installation Site"

    const customerRecord: CustomerRecord = {
      id: editingCustomerId || `cust-${Date.now()}`,
      name: displayName,
      businessName: businessName || displayName,
      contactPerson: contactName || undefined,
      phone,
      isWhatsAppSame: formBasicDetails.isWhatsAppSame,
      whatsappNumber: formBasicDetails.isWhatsAppSame
        ? phone
        : (formBasicDetails.whatsappNumber.trim() || phone),
      email,
      followUpDate: formBasicDetails.followUpDate,
      address: siteAddr,
      customerType: "RETAIL_BRAND",
      gstin: billingDetails.gstin?.trim() || undefined,
      stateCode: billingDetails.state || "33",
      paymentTerms: "ADVANCE_50",
      billingName: billingDetails.billingName?.trim() || businessName || displayName,
      billingAddress:
        billingDetails.billingAddress?.trim() ||
        [
          billingDetails.billingAddressLine1,
          billingDetails.billingAddressLine2,
          billingDetails.city,
          billingDetails.state,
          billingDetails.pincode,
        ]
          .filter(Boolean)
          .join(", ") ||
        undefined,
      billingAddressLine1: billingDetails.billingAddressLine1?.trim() || undefined,
      billingAddressLine2: billingDetails.billingAddressLine2?.trim() || undefined,
      billingCity: billingDetails.city?.trim() || undefined,
      billingState: billingDetails.state?.trim() || undefined,
      billingPincode: billingDetails.pincode?.trim() || undefined,
      isShippingSameAsBilling: billingDetails.isShippingSameAsBilling !== false,
      shippingAddress:
        (billingDetails.isShippingSameAsBilling !== false
          ? billingDetails.billingAddress ||
          [
            billingDetails.billingAddressLine1,
            billingDetails.billingAddressLine2,
            billingDetails.city,
            billingDetails.state,
            billingDetails.pincode,
          ]
            .filter(Boolean)
            .join(", ")
          : billingDetails.shippingAddress ||
          [
            billingDetails.shippingAddressLine1,
            billingDetails.shippingAddressLine2,
            billingDetails.shippingCity,
            billingDetails.shippingState,
            billingDetails.shippingPincode,
          ]
            .filter(Boolean)
            .join(", ")) || undefined,
      shippingAddressLine1:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingAddressLine1?.trim() || undefined,
      shippingAddressLine2:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingAddressLine2?.trim() || undefined,
      shippingCity:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingCity?.trim() || undefined,
      shippingState:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingState?.trim() || undefined,
      shippingPincode:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingPincode?.trim() || undefined,
      sites: formSites.map((s, idx) => ({
        ...s,
        siteName: s.siteName?.trim() || `Site ${idx + 1}`,
        address: s.address?.trim() || [s.addressLine1, s.city, s.state, s.pincode].filter(Boolean).join(", ") || "Installation Site",
      })),
      createdAt: new Date().toISOString(),
    }

    await leadsService.saveCustomer(customerRecord)

    if (editingEnquiryId) {
      try {
        await leadsService.deleteEnquiry(editingEnquiryId)
      } catch (e) {
        console.warn("Could not delete converted enquiry:", e)
      }
      setEnquiries((prev) => prev.filter((e) => e.id !== editingEnquiryId))
      setEditingEnquiryId(null)
      setCustomers((prev) => [customerRecord, ...prev])
      showToast(`Enquiry converted to customer "${customerRecord.name}" successfully`, "success")
    } else if (editingCustomerId) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomerId ? customerRecord : c))
      )
      showToast(`Customer "${customerRecord.name}" updated successfully`, "success")
    } else {
      setCustomers((prev) => [customerRecord, ...prev])
      showToast(`Customer "${customerRecord.name}" created successfully`, "success")
    }

    if (activeModule === "quotation") {
      setQuotationSelectedCustomer(customerRecord)
    }

    setIsModalOpen(false)
    setActiveTab("customer")
  }

  const handleRaiseQuoteFromDrawer = async () => {
    const val = validateCustomerForm(formBasicDetails, formSites, billingDetails)
    if (!val.isValid) {
      setFormErrors(val.errors)
      if (val.firstErrorTab) {
        setActiveRightTab(val.firstErrorTab)
      }
      return
    }

    setFormErrors({})

    const businessName = formBasicDetails.businessName.trim()
    const contactName = formBasicDetails.primaryContactName.trim()
    const displayName = contactName || businessName || "Customer"
    const phone = formBasicDetails.primaryContactNumber.trim()
    const email = formBasicDetails.email.trim()
    const firstSite = formSites[0]
    const siteAddr =
      firstSite?.address?.trim() ||
      [firstSite?.addressLine1, firstSite?.city, firstSite?.state, firstSite?.pincode]
        .filter(Boolean)
        .join(", ") ||
      billingDetails.billingAddress?.trim() ||
      "Local Installation Site"

    const customerRecord: CustomerRecord = {
      id: editingCustomerId || `cust-${Date.now()}`,
      name: displayName,
      businessName: businessName || displayName,
      contactPerson: contactName || undefined,
      phone,
      isWhatsAppSame: formBasicDetails.isWhatsAppSame,
      whatsappNumber: formBasicDetails.isWhatsAppSame
        ? phone
        : (formBasicDetails.whatsappNumber.trim() || phone),
      email,
      followUpDate: formBasicDetails.followUpDate,
      address: siteAddr,
      customerType: "RETAIL_BRAND",
      gstin: billingDetails.gstin?.trim() || undefined,
      stateCode: billingDetails.state || "33",
      paymentTerms: "ADVANCE_50",
      billingName: billingDetails.billingName?.trim() || businessName || displayName,
      billingAddress:
        billingDetails.billingAddress?.trim() ||
        [
          billingDetails.billingAddressLine1,
          billingDetails.billingAddressLine2,
          billingDetails.city,
          billingDetails.state,
          billingDetails.pincode,
        ]
          .filter(Boolean)
          .join(", ") ||
        undefined,
      billingAddressLine1: billingDetails.billingAddressLine1?.trim() || undefined,
      billingAddressLine2: billingDetails.billingAddressLine2?.trim() || undefined,
      billingCity: billingDetails.city?.trim() || undefined,
      billingState: billingDetails.state?.trim() || undefined,
      billingPincode: billingDetails.pincode?.trim() || undefined,
      isShippingSameAsBilling: billingDetails.isShippingSameAsBilling !== false,
      shippingAddress:
        (billingDetails.isShippingSameAsBilling !== false
          ? billingDetails.billingAddress ||
          [
            billingDetails.billingAddressLine1,
            billingDetails.billingAddressLine2,
            billingDetails.city,
            billingDetails.state,
            billingDetails.pincode,
          ]
            .filter(Boolean)
            .join(", ")
          : billingDetails.shippingAddress ||
          [
            billingDetails.shippingAddressLine1,
            billingDetails.shippingAddressLine2,
            billingDetails.shippingCity,
            billingDetails.shippingState,
            billingDetails.shippingPincode,
          ]
            .filter(Boolean)
            .join(", ")) || undefined,
      shippingAddressLine1:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingAddressLine1?.trim() || undefined,
      shippingAddressLine2:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingAddressLine2?.trim() || undefined,
      shippingCity:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingCity?.trim() || undefined,
      shippingState:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingState?.trim() || undefined,
      shippingPincode:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingPincode?.trim() || undefined,
      sites: formSites.map((s, idx) => ({
        ...s,
        siteName: s.siteName?.trim() || `Site ${idx + 1}`,
        address: s.address?.trim() || [s.addressLine1, s.city, s.state, s.pincode].filter(Boolean).join(", ") || "Installation Site",
      })),
      createdAt: new Date().toISOString(),
    }

    try {
      await leadsService.saveCustomer(customerRecord)
    } catch (e) {
      console.warn("Could not persist customer to backend:", e)
    }

    if (editingEnquiryId) {
      try {
        await leadsService.deleteEnquiry(editingEnquiryId)
      } catch (e) {
        console.warn("Could not delete converted enquiry on raise quote:", e)
      }
      setEnquiries((prev) => prev.filter((e) => e.id !== editingEnquiryId))
      setEditingEnquiryId(null)
      setCustomers((prev) => [customerRecord, ...prev])
      showToast(`Enquiry converted to customer "${customerRecord.name}" - Quote initiated`, "success")
    } else if (editingCustomerId) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomerId ? customerRecord : c))
      )
    } else {
      setCustomers((prev) => [customerRecord, ...prev])
    }

    setQuotationSelectedCustomer(customerRecord)
    setIsModalOpen(false)
    setActiveModule("quotation")

  }

  const handleSaveAsEnquiry = async () => {
    const contactName =
      formBasicDetails.primaryContactName.trim() || formBasicDetails.businessName.trim()
    const phone = formBasicDetails.primaryContactNumber.trim()
    const firstSite = formSites[0]
    const firstService = firstSite?.serviceDetails?.[0]
    const inquiryNote = firstService?.signStyle
      ? `${firstService.signStyle}${firstService.width && firstService.height ? ` (${firstService.width}x${firstService.height} ${firstService.unit || "ft"})` : ""}${firstService.notes ? ` - ${firstService.notes}` : ""}`
      : "General Signage Requirement"

    const val = validateEnquiryForm({
      contactName,
      phone,
      email: formBasicDetails.email,
      inquiryNote,
    })

    if (!val.isValid) {
      setFormErrors(val.errors)
      return
    }

    const siteAddr =
      firstSite?.address?.trim() ||
      [firstSite?.addressLine1, firstSite?.city, firstSite?.state, firstSite?.pincode]
        .filter(Boolean)
        .join(", ") ||
      ""

    const newEnquiry: EnquiryRecord = {
      id: editingEnquiryId || `enq-${Date.now()}`,
      contactName,
      phone,
      email: formBasicDetails.email.trim() || undefined,
      address: siteAddr || undefined,
      source: "WALK_IN",
      stage: formBasicDetails.followUpDate ? "NEEDS_FOLLOW_UP" : "NEW",
      followUpDate: formBasicDetails.followUpDate || undefined,
      inquiryNote,
      hasVectorLogo: (firstService?.referenceFiles?.length || 0) > 0,
      wallSubstrate: "CONCRETE",
      mountingHeightFt: 10,
      hasPowerPoint: true,
      createdAt: new Date().toISOString(),
    }

    await leadsService.saveEnquiry(newEnquiry)
    if (editingEnquiryId) {
      setEnquiries((prev) =>
        prev.map((e) => (e.id === editingEnquiryId ? newEnquiry : e))
      )
      showToast(`Enquiry for "${newEnquiry.contactName}" updated successfully`, "success")
    } else {
      setEnquiries((prev) => [newEnquiry, ...prev])
      showToast(`Enquiry for "${newEnquiry.contactName}" created successfully`, "success")
    }

    if (newEnquiry.followUpDate && isDueForFollowUpReminder(newEnquiry.followUpDate)) {
      triggerFollowUpReminder(newEnquiry)
    }

    setIsModalOpen(false)
    setEditingCustomerId(null)
    setEditingEnquiryId(null)
    setActiveTab("enquiry")
  }

  // Site manipulation handlers
  const handleToggleCollapse = (siteId: string) => {
    setCollapsedSites((prev) => {
      const next = new Set(prev)
      if (next.has(siteId)) {
        next.delete(siteId)
      } else {
        next.add(siteId)
      }
      return next
    })
  }

  const handleDeleteSite = (siteIndex: number) => {
    if (formSites.length <= 1) {
      return
    }
    const updated = formSites.filter((_, idx) => idx !== siteIndex)
    setFormSites(updated)
  }

  const handleAddAnotherSite = () => {
    const nextNum = formSites.length + 1
    const newSite = createDefaultSite(nextNum)
    setFormSites([...formSites, newSite])
  }

  // Service manipulation handlers
  const handleAddService = (siteIndex: number) => {
    const targetSite = formSites[siteIndex]
    const currentServices = targetSite.serviceDetails || []
    const nextServiceNum = currentServices.length + 1
    const newService: ServiceItem = {
      id: `srv-${Date.now()}-${nextServiceNum}`,
      serviceNumber: nextServiceNum,
      signStyle: "",
      application: "Outdoor",
      width: "",
      height: "",
      unit: "ft",
      quantity: 1,
      notSureOfDimensions: false,
      material: "",
      finishing: "",
      artworkStatus: "",
      color: "",
      referenceFiles: [],
      referenceImages: [],
      notes: "",
    }
    const updated = [...formSites]
    updated[siteIndex] = {
      ...targetSite,
      serviceDetails: [...currentServices, newService],
    }
    setFormSites(updated)
  }

  const handleDeleteService = (siteIndex: number, serviceIndex: number) => {
    const targetSite = formSites[siteIndex]
    const currentServices = targetSite.serviceDetails || []
    if (currentServices.length <= 1) return
    const updatedServices = currentServices.filter((_, idx) => idx !== serviceIndex)
    const updated = [...formSites]
    updated[siteIndex] = {
      ...targetSite,
      serviceDetails: updatedServices,
    }
    setFormSites(updated)
  }





  const isLockedViewportModule = activeModule === "settings"

  return (
    <div className={`printpal-leads-container ${isLockedViewportModule ? "materials-finishes-locked" : ""}`}>
      {/* ── 1. Top Navbar (PrintPal, Nav links, JD profile) (Desktop - 1, 2) ── */}
      <header className="printpal-top-nav flex-shrink-0">
        <div className="printpal-nav-left">
          <div className="printpal-brand-title" onClick={() => setIsModalOpen(false)}>
            PrintPal
          </div>

          <div className="printpal-nav-links">
            <button
              type="button"
              className={`printpal-nav-link ${activeModule === "leads" ? "active" : ""}`}
              onClick={() => {
                closeNewCustomerModal()
                setActiveModule("leads")
              }}
            >
              <Users />
              <span>Leads</span>
            </button>
            <button
              type="button"
              className={`printpal-nav-link ${activeModule === "quotation" ? "active" : ""}`}
              onClick={() => {
                closeNewCustomerModal()
                setActiveModule("quotation")
              }}
            >
              <FileText />
              <span>Quotation</span>
            </button>
            <button
              type="button"
              className={`printpal-nav-link ${activeModule === "quotationReports" ? "active" : ""}`}
              onClick={() => {
                closeNewCustomerModal()
                setActiveModule("quotationReports")
              }}
            >
              <FileText />
              <span>Quotation Reports</span>
            </button>
          </div>
        </div>

        {/* User Credential Component with Settings, Support & Notification on the right */}
        <div className="printpal-nav-right flex items-center gap-1.5">
          {/* Settings Nav Link */}
          <button
            type="button"
            className={`printpal-nav-link mr-2 ${activeModule === "settings" ? "active" : ""}`}
            onClick={() => {
              closeNewCustomerModal()
              setActiveModule("settings")
            }}
          >
            <Settings />
            <span>Settings</span>
          </button>

          {/* Support Icon */}
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#737B84] hover:text-[#202428] hover:bg-[#F3F5F7] transition-colors cursor-pointer border-none bg-transparent"
            title="Help & Support"
            onClick={() =>
              palNotch.info(
                "PrintPal Workshop Support",
                "Reach us at help@printpal.in for quotation or technical assistance.",
                undefined,
                "SUPPORT"
              )
            }
          >
            <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>

          {/* Notification Icon */}
          <button
            type="button"
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-[#737B84] hover:text-[#202428] hover:bg-[#F3F5F7] transition-colors cursor-pointer border-none bg-transparent mr-1"
            title="Notifications"
            onClick={() => { }}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>

          <div className="relative">
            <div
              className="printpal-user-pill"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              role="button"
              tabIndex={0}
              title={user?.primaryEmailAddress?.emailAddress || "User Profile"}
            >
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "User Avatar"}
                  className="w-8 h-8 rounded-full object-cover border border-[#E4E7EC]"
                />
              ) : (
                <div className="printpal-avatar">
                  {(user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "P").toUpperCase()}
                </div>
              )}
              <span className="printpal-user-name">
                {user?.firstName || user?.fullName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Operator"}
              </span>
              <ChevronDown className={`printpal-user-chevron transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
            </div>

            {/* Dropdown Menu with Logout */}
            {isUserMenuOpen && (
              <>
                {/* Backdrop overlay to close menu when clicking outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white border border-[#E4E7EC] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{ boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.15)" }}
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-[#F2F4F7]">
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border border-[#E4E7EC] flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#FA772C] text-white font-semibold flex items-center justify-center text-sm flex-shrink-0">
                        {(user?.firstName?.[0] || "P").toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#101828] truncate">
                        {user?.fullName || "Workshop Operator"}
                      </div>
                      <div className="text-xs text-[#667085] truncate font-mono mt-0.5">
                        {user?.primaryEmailAddress?.emailAddress || "Logged in"}
                      </div>
                    </div>
                  </div>

                  <div className="py-2.5 px-1 text-[11px] text-[#475467] flex items-center justify-between">
                    <span className="font-medium text-[#667085]">Workspace</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FA772C]/10 text-[#FA772C] font-semibold text-[10px]">
                      PrintPal ERP
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#F2F4F7]">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsUserMenuOpen(false)
                        if (clerk) {
                          await clerk.signOut()
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out / Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. Top PAL Notch (Sileo Gooey Physics × SmoothUI Dynamic Island Toast) ── */}
      <PalNotch
        activeModuleLabel={
          activeModule === "leads"
            ? "Leads"
            : activeModule === "quotation"
              ? "Quotation"
              : activeModule === "quotationReports"
                ? "Quotation Reports"
                : "Settings"
        }
      />

      {/* ── 3. Main Content Body (Desktop - 1 & 2) ── */}
      {activeModule === "quotation" ? (
        <QuotationView
          customers={customers}
          products={products}
          materials={materials}
          finishes={finishes}
          onOpenCustomerDrawer={openDrawer}
          showToast={showToast}
          initialCustomer={quotationSelectedCustomer}
          businessDetails={businessDetails}
          isSupplierEnabled={isSupplierEnabled}
          renegotiatingQuote={renegotiatingQuote}
          onClearRenegotiatingQuote={() => setRenegotiatingQuote(null)}
        />
      ) : activeModule === "quotationReports" ? (
        <QuotationReportsView
          customers={customers}
          showToast={showToast}
          businessDetails={businessDetails}
          onCreateQuotation={() => {
            setRenegotiatingQuote(null)
            setActiveModule("quotation")
          }}
          onRenegotiateQuotation={handleRenegotiateQuotation}
        />
      ) : activeModule === "settings" ? (
        <main className={`printpal-content-body printpal-settings-page ${isLockedViewportModule ? "materials-finishes-locked" : ""} flex flex-col`}>
          {/* Settings Header matching Wireframe Screenshot (White background) */}
          <section className="printpal-leads-header flex-shrink-0 bg-white border-b border-[#DCE1E5]">
            <div className="printpal-leads-title-block">
              <h1 className="printpal-leads-title">Settings</h1>
            </div>
          </section>

          {/* Settings Two-Column Layout: Left Side Menu | Right Content Area */}
          <div className="flex-1 min-h-0 flex flex-row overflow-hidden">
            {/* Left Side Menu (White background) */}
            <aside className="w-60 flex-shrink-0 printpal-settings-sidebar bg-white border-r border-[#DCE1E5] py-4 px-4 flex flex-col gap-3 overflow-y-auto select-none">
              {/* Group 0: Business Setting */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleSettingsGroup("businessSetting")}
                  className="w-full flex items-center justify-between py-2 px-2 text-[14px] font-semibold text-[#202428] hover:text-[#E05626] hover:bg-[#FFF5F2] rounded-md transition-colors text-left cursor-pointer"
                >
                  <span>Business Setting</span>
                  {expandedSettingsGroups.businessSetting ? (
                    <ChevronDown className="h-4 w-4 text-[#737B84]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#737B84]" />
                  )}
                </button>
                {expandedSettingsGroups.businessSetting && (
                  <div className="flex flex-col pl-3 pt-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setSettingsMenu("businessDetails")}
                      className={`w-full text-left px-3 py-2 text-[13px] rounded-md transition-colors cursor-pointer ${settingsMenu === "businessDetails"
                        ? "text-[#E05626] font-semibold bg-[#FFF5F2]"
                        : "text-[#475569] hover:bg-[#FFF5F2] hover:text-[#E05626]"
                        }`}
                    >
                      Business Details
                    </button>
                  </div>
                )}
              </div>

              {/* Group 1: Products */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleSettingsGroup("products")}
                  className="w-full flex items-center justify-between py-2 px-2 text-[14px] font-semibold text-[#202428] hover:text-[#E05626] hover:bg-[#FFF5F2] rounded-md transition-colors text-left cursor-pointer"
                >
                  <span>Products</span>
                  {expandedSettingsGroups.products ? (
                    <ChevronDown className="h-4 w-4 text-[#737B84]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#737B84]" />
                  )}
                </button>
                {expandedSettingsGroups.products && (
                  <div className="flex flex-col pl-3 pt-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setSettingsMenu("products")}
                      className={`w-full text-left px-3 py-2 text-[13px] rounded-md transition-colors cursor-pointer ${settingsMenu === "products"
                        ? "text-[#E05626] font-semibold bg-[#FFF5F2]"
                        : "text-[#475569] hover:bg-[#FFF5F2] hover:text-[#E05626]"
                        }`}
                    >
                      Products
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsMenu("materials")}
                      className={`w-full text-left px-3 py-2 text-[13px] rounded-md transition-colors cursor-pointer ${settingsMenu === "materials"
                        ? "text-[#E05626] font-semibold bg-[#FFF5F2]"
                        : "text-[#475569] hover:bg-[#FFF5F2] hover:text-[#E05626]"
                        }`}
                    >
                      Materials
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsMenu("finishes")}
                      className={`w-full text-left px-3 py-2 text-[13px] rounded-md transition-colors cursor-pointer ${settingsMenu === "finishes"
                        ? "text-[#E05626] font-semibold bg-[#FFF5F2]"
                        : "text-[#475569] hover:bg-[#FFF5F2] hover:text-[#E05626]"
                        }`}
                    >
                      Finishes
                    </button>
                  </div>
                )}
              </div>

              {/* Group 2: Quotation */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleSettingsGroup("quotation")}
                  className="w-full flex items-center justify-between py-2 px-2 text-[14px] font-semibold text-[#202428] hover:text-[#E05626] hover:bg-[#FFF5F2] rounded-md transition-colors text-left cursor-pointer"
                >
                  <span>Quotation</span>
                  {expandedSettingsGroups.quotation ? (
                    <ChevronDown className="h-4 w-4 text-[#737B84]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#737B84]" />
                  )}
                </button>
                {expandedSettingsGroups.quotation && (
                  <div className="flex flex-col pl-3 pt-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setSettingsMenu("tax")}
                      className={`w-full text-left px-3 py-2 text-[13px] rounded-md transition-colors cursor-pointer ${settingsMenu === "tax"
                        ? "text-[#E05626] font-semibold bg-[#FFF5F2]"
                        : "text-[#475569] hover:bg-[#FFF5F2] hover:text-[#E05626]"
                        }`}
                    >
                      Tax
                    </button>
                  </div>
                )}
              </div>

              {/* Group 3: Supplier */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleSettingsGroup("supplier")}
                  className="w-full flex items-center justify-between py-2 px-2 text-[14px] font-semibold text-[#202428] hover:text-[#E05626] hover:bg-[#FFF5F2] rounded-md transition-colors text-left cursor-pointer"
                >
                  <span>Supplier</span>
                  {expandedSettingsGroups.supplier ? (
                    <ChevronDown className="h-4 w-4 text-[#737B84]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#737B84]" />
                  )}
                </button>
                {expandedSettingsGroups.supplier && (
                  <div className="flex flex-col pl-3 pt-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setSettingsMenu("supplier")}
                      className={`w-full text-left px-3 py-2 text-[13px] rounded-md transition-colors cursor-pointer ${settingsMenu === "supplier"
                        ? "text-[#E05626] font-semibold bg-[#FFF5F2]"
                        : "text-[#475569] hover:bg-[#FFF5F2] hover:text-[#E05626]"
                        }`}
                    >
                      Supplier
                    </button>
                  </div>
                )}
              </div>
            </aside>

            {/* Right Space Table / Content Area */}
            <div className="flex-1 min-h-0 p-6 overflow-y-auto printpal-compact-scroll flex flex-col items-stretch printpal-settings-workspace bg-[#F3F5F7]">
              {settingsMenu === "businessDetails" && (
                <BusinessDetailsView
                  value={businessDetails}
                  taxes={taxes}
                  applyTaxesToSaleableItems={applyTaxesToSaleableItems}
                  onSave={handleSaveBusinessDetails}
                  showToast={showToast}
                />
              )}

              {settingsMenu === "products" && (
                <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden pr-8 pb-4">
                  {/* Product Header & Action Bar matching Reference Screen */}
                  <section className="flex items-start justify-between mb-5 flex-shrink-0">
                    <div className="printpal-leads-title-block">
                      <h1 className="printpal-leads-title">Products</h1>
                      <div className="printpal-leads-subtitle">
                        Manage signage catalog products, substrate materials, and finishing specifications
                      </div>
                    </div>

                    <div className="printpal-leads-controls flex-shrink-0">
                      <Button
                        variant="orange"
                        className="printpal-btn-primary font-medium w-[164px] min-w-[164px]"
                        id="btn-add-product"
                        onClick={() => openDrawerForProduct()}
                      >
                        Add new Product
                      </Button>
                    </div>
                  </section>

                  {/* Full-Width Workspace: Products Table */}
                  <div className="flex-1 w-full min-h-0 bg-white border border-[#DCE1E5] rounded-[12px] p-2 flex flex-col box-border shadow-none overflow-hidden max-h-[calc(100vh-220px)]">
                    <div className="printpal-table-header printpal-product-grid flex-shrink-0">
                      <div>Product Name</div>
                      <div>Description</div>
                      <div className="text-center">Materials Tagged</div>
                      <div className="text-center">Finishes Tagged</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll mt-1">
                      {products.length === 0 ? (
                        <div className="p-12 text-center text-xs text-[#94A3B8]">
                          <div className="printpal-empty-illustration-wrap scale-75 mb-2">
                            <ProductEmptyIllustration />
                          </div>
                          No products cataloged yet. Click Add new Product to add one.
                        </div>
                      ) : (
                        products.map((prod) => (
                          <ProductRow
                            key={prod.id}
                            prod={prod}
                            materials={materials}
                            finishes={finishes}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {settingsMenu === "materials" && (
                <div className="w-full max-w-3xl mx-auto flex-1 min-h-0 flex flex-col overflow-hidden pb-4">
                  {/* Header & Action Bar matching Reference Screen */}
                  <section className="flex items-start justify-between mb-5 flex-shrink-0">
                    <div className="printpal-leads-title-block">
                      <h1 className="printpal-leads-title">Materials</h1>
                      <div className="printpal-leads-subtitle">
                        Manage substrate and raw material inventory specs used in signage fabrication
                      </div>
                    </div>

                    <div className="printpal-leads-controls flex-shrink-0">
                      <Button
                        variant="orange"
                        className="printpal-btn-primary font-medium w-[164px] min-w-[164px]"
                        id="btn-add-material"
                        onClick={() => openMaterialPrompt()}
                      >
                        Add new Material
                      </Button>
                    </div>
                  </section>

                  {/* Centered Table Card */}
                  <div className="flex-1 w-full min-h-0 bg-white border border-[#DCE1E5] rounded-[12px] p-2 flex flex-col box-border shadow-none overflow-hidden max-h-[calc(100vh-220px)]">
                    <div className="flex items-center justify-between px-3 py-2 text-[12px] font-semibold text-[#737B84] bg-[#F8FAFC] rounded-[8px] flex-shrink-0 border-b border-[#E2E8F0]">
                      <div>Material Name</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll mt-1">
                      {materials.length === 0 ? (
                        <div className="p-12 text-center text-xs text-[#94A3B8]">
                          <div className="printpal-empty-illustration-wrap scale-75 mb-2">
                            <MaterialEmptyIllustration />
                          </div>
                          No materials cataloged yet. Click Add new Material to add one.
                        </div>
                      ) : (
                        materials.map((mat) => (
                          <MaterialRow
                            key={mat.id}
                            mat={mat}
                            onEdit={handleEditMaterial}
                            onDelete={handleDeleteMaterial}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {settingsMenu === "finishes" && (
                <div className="w-full max-w-3xl mx-auto flex-1 min-h-0 flex flex-col overflow-hidden pb-4">
                  {/* Header & Action Bar matching Reference Screen */}
                  <section className="flex items-start justify-between mb-5 flex-shrink-0">
                    <div className="printpal-leads-title-block">
                      <h1 className="printpal-leads-title">Finishes</h1>
                      <div className="printpal-leads-subtitle">
                        Manage coatings, laminations, and surface finishing treatments
                      </div>
                    </div>

                    <div className="printpal-leads-controls flex-shrink-0">
                      <Button
                        variant="orange"
                        className="printpal-btn-primary font-medium w-[164px] min-w-[164px]"
                        id="btn-add-finish"
                        onClick={() => openFinishPrompt()}
                      >
                        Add new Finish
                      </Button>
                    </div>
                  </section>

                  {/* Centered Table Card */}
                  <div className="flex-1 w-full min-h-0 bg-white border border-[#DCE1E5] rounded-[12px] p-2 flex flex-col box-border shadow-none overflow-hidden max-h-[calc(100vh-220px)]">
                    <div className="flex items-center justify-between px-3 py-2 text-[12px] font-semibold text-[#737B84] bg-[#F8FAFC] rounded-[8px] flex-shrink-0 border-b border-[#E2E8F0]">
                      <div>Finishes Name</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll mt-1">
                      {finishes.length === 0 ? (
                        <div className="p-12 text-center text-xs text-[#94A3B8]">
                          <div className="printpal-empty-illustration-wrap scale-75 mb-2">
                            <FinishEmptyIllustration />
                          </div>
                          No finishes cataloged yet. Click Add new Finish to add one.
                        </div>
                      ) : (
                        finishes.map((fin) => (
                          <FinishRow
                            key={fin.id}
                            fin={fin}
                            onEdit={handleEditFinish}
                            onDelete={handleDeleteFinish}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {settingsMenu === "tax" && (
                <div className="w-full max-w-3xl mx-auto flex-1 min-h-0 flex flex-col overflow-hidden pb-4">
                  {/* Header & Action Bar matching Reference Screen */}
                  <section className="flex items-start justify-between mb-5 flex-shrink-0">
                    <div className="printpal-leads-title-block">
                      <h1 className="printpal-leads-title">Tax</h1>
                      <div className="printpal-leads-subtitle">
                        Configure GST and sales tax rates applicable to quotation line items and services
                      </div>
                    </div>

                    <div className="printpal-leads-controls flex-shrink-0">
                      <Button
                        variant="orange"
                        className="printpal-btn-primary font-medium w-[164px] min-w-[164px] disabled:opacity-50 disabled:cursor-not-allowed"
                        id="btn-add-tax"
                        disabled={!applyTaxesToSaleableItems}
                        onClick={handleOpenAddTaxModal}
                      >
                        Add Tax
                      </Button>
                    </div>
                  </section>

                  {/* Card 1: Toggle Card Component */}
                  <div className="w-full bg-white border border-[#DCE1E5] rounded-[12px] p-4 flex items-start gap-3 flex-shrink-0 mb-3 box-border shadow-none">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={applyTaxesToSaleableItems}
                      onClick={() => {
                        const nextVal = !applyTaxesToSaleableItems
                        setApplyTaxesToSaleableItems(nextVal)
                        try {
                          localStorage.setItem("printpal_apply_taxes", String(nextVal))
                        } catch { }
                        showToast(
                          nextVal
                            ? "Taxes enabled for saleable items"
                            : "Taxes disabled for saleable items",
                          "info"
                        )
                      }}
                      className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${applyTaxesToSaleableItems ? "bg-[#E05626]" : "bg-[#CBD5E1]"
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${applyTaxesToSaleableItems ? "translate-x-5" : "translate-x-0"
                          }`}
                      />
                    </button>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[#1E293B]">
                        Apply taxes to saleable items
                      </span>
                      <span className="text-[12px] text-[#64748B] leading-relaxed mt-0.5 max-w-[560px]">
                        Each item can have only one tax component. For multiple taxes, create a tax group and select the appropriate options.
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Table Card Component (matches Materials & Finishes) */}
                  <div
                    className={`flex-1 w-full min-h-0 bg-white border border-[#DCE1E5] rounded-[12px] p-2 flex flex-col box-border shadow-none overflow-hidden max-h-[calc(100vh-270px)] transition-all duration-200 ${!applyTaxesToSaleableItems
                      ? "opacity-40 pointer-events-none select-none bg-[#F8FAFC]"
                      : ""
                      }`}
                  >
                    <div className="grid grid-cols-12 items-center px-3 py-2 text-[12px] font-semibold text-[#737B84] bg-[#F8FAFC] rounded-[8px] flex-shrink-0 border-b border-[#E2E8F0]">
                      <div className="col-span-6">Tax Name</div>
                      <div className="col-span-4">Percentage</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll mt-1">
                      {taxes.length === 0 ? (
                        <div className="p-12 text-center text-xs text-[#94A3B8]">
                          No taxes configured yet. Click "Add Tax" to add one.
                        </div>
                      ) : (
                        taxes.map((tax) => (
                          <div
                            key={tax.id}
                            className="grid grid-cols-12 items-center px-3 py-2 min-h-[48px] hover:bg-[#FBFCFD] transition-colors border-b border-[#DCE1E5] last:border-b-0"
                          >
                            <div className="col-span-6 text-[14px] font-medium text-[#202428]">
                              {tax.name}
                            </div>
                            <div className="col-span-4 text-[14px] text-[#475569]">
                              {tax.percentage}%
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-1.5 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditTaxModal(tax)}
                                className="p-1 text-[#60A5FA] hover:text-[#2563EB] transition-colors cursor-pointer bg-transparent border-0 outline-none"
                                title="Edit Tax"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTax(tax)}
                                className="p-1 text-[#F87171] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-0 outline-none"
                                title="Delete Tax"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {settingsMenu === "supplier" && (
                <div className="w-full max-w-3xl mx-auto min-h-0 bg-white border border-[#DCE1E5] rounded-[14px] p-6 flex flex-col box-border shadow-none">
                  {/* Heading & Subtitle */}
                  <div className="mb-5">
                    <h2 className="text-[18px] font-semibold text-[#1E293B]">Supplier Setting</h2>
                    <p className="text-[13px] text-[#64748B] mt-1">
                      Configure supplier directory visibility and trade vendor management
                    </p>
                  </div>

                  {/* Toggle Card Section */}
                  <div className="flex items-start justify-between p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                    <div className="flex flex-col pr-4">
                      <span className="text-[14px] font-medium text-[#1E293B]">
                        Enable Supplier Management
                      </span>
                      <span className="text-[12px] text-[#64748B] leading-relaxed mt-1">
                        When enabled, the Supplier tab is accessible in the Leads module and preferred vendor fields are available in Products & Materials. When disabled, these options will be hidden across the workspace.
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={isSupplierEnabled}
                      onClick={() => {
                        const nextVal = !isSupplierEnabled
                        setIsSupplierEnabled(nextVal)
                        localStorage.setItem("printpal_supplier_enabled", String(nextVal))
                        if (!nextVal && activeTab === "supplier") {
                          setActiveTab("customer")
                        }
                        showToast(
                          nextVal
                            ? "Supplier module enabled"
                            : "Supplier module disabled",
                          "info"
                        )
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${isSupplierEnabled ? "bg-[#1D4ED8]" : "bg-[#CBD5E1]"
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isSupplierEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        <main className="printpal-content-body">
          {/* Leads Header & Action Bar */}
          <section className="printpal-leads-header">
            <div className="printpal-leads-title-block">
              <h1 className="printpal-leads-title">Leads</h1>
              <div className="printpal-leads-subtitle">
                Manage and track your enquiries, customers and their requirements
              </div>
            </div>

            <div className="printpal-leads-controls">
              {/* Segmented Control [ Customer | Enquiry | Supplier ] */}
              <div className="printpal-segmented-toggle" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "customer"}
                  className={`printpal-segment-btn ${activeTab === "customer" ? "active" : ""}`}
                  onClick={() => {
                    closeNewCustomerModal()
                    setActiveTab("customer")
                  }}
                >
                  Customer
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "enquiry"}
                  className={`printpal-segment-btn ${activeTab === "enquiry" ? "active" : ""}`}
                  onClick={() => {
                    closeNewCustomerModal()
                    setActiveTab("enquiry")
                  }}
                >
                  Enquiry
                </button>
                {isSupplierEnabled && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "supplier"}
                    className={`printpal-segment-btn ${activeTab === "supplier" ? "active" : ""}`}
                    onClick={() => {
                      closeNewCustomerModal()
                      setActiveTab("supplier")
                    }}
                  >
                    Supplier
                  </button>
                )}
              </div>

              {/* Primary Action Button */}
              <Button
                variant="orange"
                className="printpal-btn-primary font-medium w-[164px] min-w-[164px]"
                id="btn-add-customer"
                onClick={() => {
                  if (activeTab === "customer") {
                    openDrawer(false, undefined, "New Customer")
                  } else if (activeTab === "enquiry") {
                    openDrawer(false, undefined, "New Enquiry")
                  } else if (isSupplierEnabled) {
                    openDrawerForSupplier()
                  }
                }}
              >
                {activeTab === "customer"
                  ? "Add new Customer"
                  : activeTab === "enquiry"
                    ? "Add new Enquiry"
                    : isSupplierEnabled
                      ? "Add new Supplier"
                      : "Add new Customer"}
              </Button>
            </div>
          </section>

          {/* ── 4. Table Card (8px padding, 14px font size, Desktop - 2 feel) ── */}
          <div className="printpal-table-card">
            {/* Table Header Row */}
            <div className={`printpal-table-header flex-shrink-0 ${activeTab === "supplier" ? "printpal-supplier-grid" : ""}`}>
              {activeTab === "supplier" ? (
                <>
                  <div>Supplier / Company</div>
                  <div>Contact Person</div>
                  <div>Phone & Email</div>
                  <div>What They Supply</div>
                  <div>Actions</div>
                </>
              ) : (
                <>
                  <div>Name</div>
                  <div>Number</div>
                  <div>Email</div>
                  <div>Site Address</div>
                  <div>Actions</div>
                </>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll">
              {activeTab === "customer" ? (
                customers.length === 0 ? (
                  /* Apple-Grade Empty State for Customers (Minimal Vector Illustration, No Button) */
                  <div className="printpal-empty-state-canvas">
                    <div className="printpal-empty-state-card">
                      <div className="printpal-empty-illustration-wrap">
                        <CustomerEmptyIllustration />
                      </div>
                      <h3 className="printpal-empty-title">No customers created yet</h3>
                      <p className="printpal-empty-description">
                        Register your first commercial client, link multiple fabrication & installation sites, and track dimensional signage specifications.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Desktop - 2: Populated Table Rows with 14px font size */
                  customers.map((cust) => (
                    <CustomerRow
                      key={cust.id}
                      cust={cust}
                      onEdit={handleEditCustomer}
                      onDelete={handleDeleteCustomer}
                      onViewSites={handleViewSites}
                    />
                  ))
                )
              ) : activeTab === "enquiry" ? (
                enquiries.length === 0 ? (
                  /* Apple-Grade Empty State for Enquiries (Minimal Vector Illustration, No Button) */
                  <div className="printpal-empty-state-canvas">
                    <div className="printpal-empty-state-card">
                      <div className="printpal-empty-illustration-wrap">
                        <EnquiryEmptyIllustration />
                      </div>
                      <h3 className="printpal-empty-title">No enquiries created yet</h3>
                      <p className="printpal-empty-description">
                        Quick-capture incoming workshop leads from WhatsApp, phone inquiries, or walk-ins to qualify leads and estimate projects.
                      </p>
                    </div>
                  </div>
                ) : (
                  enquiries.map((enq) => (
                    <EnquiryRow
                      key={enq.id}
                      enq={enq}
                      onEdit={handleEditEnquiry}
                      onDelete={handleDeleteEnquiry}
                    />
                  ))
                )
              ) : isSupplierEnabled ? (
                /* 3rd Tab: Supplier Table */
                suppliers.length === 0 ? (
                  <div className="printpal-empty-state-canvas">
                    <div className="printpal-empty-state-card">
                      <div className="printpal-empty-illustration-wrap">
                        <SupplierEmptyIllustration />
                      </div>
                      <h3 className="printpal-empty-title">No suppliers created yet</h3>
                      <p className="printpal-empty-description">
                        Register raw material vendors, track supplier contacts, and catalog fabrication substrates for acrylic, ACP, and LED sign components.
                      </p>
                    </div>
                  </div>
                ) : (
                  suppliers.map((supp) => (
                    <SupplierRow
                      key={supp.id}
                      supp={supp}
                      onEdit={handleEditSupplier}
                      onDelete={handleDeleteSupplier}
                    />
                  ))
                )
              ) : null}
            </div>
          </div>
        </main>
      )}

      {/* ── 5. New Customer / Enquiry Modal / Drawer (Desktop - 4 Exact Two-Column Apple Spec) ── */}
      <div
        className={`printpal-modal-overlay ${isModalOpen ? "open" : ""}`}
        id="new-customer-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeNewCustomerModal()
          }
        }}
      >
        <div
          className="printpal-modal-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-sheet-title"
        >
          {/* Fixed Top Header Bar inside Modal (Desktop - 4) */}
          <div className="printpal-modal-header-bar">
            <h2 className="printpal-modal-title-text" id="modal-sheet-title">
              {drawerTitle}
            </h2>

            <div className="printpal-modal-header-actions">
              <Button
                variant="outline"
                type="button"
                className="printpal-btn-cancel"
                onClick={closeNewCustomerModal}
              >
                Cancel
              </Button>
              {!drawerTitle.includes("Supplier") && !drawerTitle.includes("Product") && !drawerTitle.includes("Material") && !drawerTitle.includes("Finish") && (
                <Button
                  variant="outline"
                  type="button"
                  className="border-[#D7440E] text-[#D7440E] hover:bg-[#D7440E]/10 hover:text-[#D7440E] hover:border-[#D7440E] text-[13px] font-medium transition-colors shadow-none cursor-pointer"
                  onClick={handleRaiseQuoteFromDrawer}
                >
                  Raise Quote
                </Button>
              )}
              <Button
                variant="orange"
                type="button"
                className="printpal-btn-save"
                onClick={() => {
                  if (drawerTitle.includes("Supplier")) {
                    handleSaveSupplier()
                  } else if (drawerTitle.includes("Product")) {
                    handleSaveProduct()
                  } else if (drawerTitle.includes("Material")) {
                    handleSaveMaterial()
                  } else if (drawerTitle.includes("Finish")) {
                    handleSaveFinish()
                  } else {
                    handleSaveCustomer()
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>

          {/* Scrollable Modal Content Body (20px padding on all sides) */}
          <div className="printpal-modal-scroll-content">
            {drawerTitle.includes("Supplier") ? (
              /* Supplier Form in 2-Column Desktop Spec (Identical to Customer Drawer) */
              <div className="printpal-new-cust-grid-wrapper">
                {Object.keys(supplierErrors).length > 0 && (
                  <div className="flex items-center gap-2 p-3 mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <span>
                      Please resolve the {Object.keys(supplierErrors).length} error{Object.keys(supplierErrors).length > 1 ? "s" : ""} marked below to save the supplier.
                    </span>
                  </div>
                )}

                <div className="printpal-new-cust-grid">
                  {/* ── Left Column Card: Basic Supplier Details (300px Fixated) ── */}
                  <div className="printpal-card-basic-details">
                    <div className="printpal-card-title">Supplier Details</div>

                    {/* 1. Company Name */}
                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="supp-name">
                        Company Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="supp-name"
                        placeholder="e.g. Mehta Acrylics & Plastics"
                        className={`printpal-form-input ${supplierErrors.supplierName ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                        value={supplierForm.supplierName}
                        onChange={(e) => {
                          setSupplierForm((prev) => ({ ...prev, supplierName: e.target.value }))
                          if (supplierErrors.supplierName) {
                            setSupplierErrors((prev) => {
                              const n = { ...prev }
                              delete n.supplierName
                              return n
                            })
                          }
                        }}
                      />
                      {supplierErrors.supplierName && (
                        <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {supplierErrors.supplierName}
                        </span>
                      )}
                    </div>

                    {/* 2. Supplier Name (Contact Person) */}
                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="supp-contact">
                        Supplier Name (Contact Person)
                      </Label>
                      <Input
                        id="supp-contact"
                        placeholder="e.g. Rajesh Mehta"
                        className="printpal-form-input"
                        value={supplierForm.contactPerson}
                        onChange={(e) =>
                          setSupplierForm((prev) => ({ ...prev, contactPerson: e.target.value }))
                        }
                      />
                    </div>

                    {/* 3. Supplier Number (Phone) */}
                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="supp-phone">
                        Supplier Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="supp-phone"
                        type="tel"
                        placeholder="e.g. 98400 12345"
                        className={`printpal-form-input ${supplierErrors.phone ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                        value={supplierForm.phone}
                        onChange={(e) => {
                          const val = e.target.value
                          setSupplierForm((prev) => ({
                            ...prev,
                            phone: val,
                            whatsappNumber: prev.isWhatsAppSame ? val : prev.whatsappNumber,
                          }))
                          if (supplierErrors.phone) {
                            setSupplierErrors((prev) => {
                              const n = { ...prev }
                              delete n.phone
                              return n
                            })
                          }
                        }}
                      />
                      {supplierErrors.phone && (
                        <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {supplierErrors.phone}
                        </span>
                      )}

                      {/* WhatsApp Checkbox */}
                      <div className="printpal-checkbox-label">
                        <Checkbox
                          id="supp-whatsapp-same"
                          checked={supplierForm.isWhatsAppSame}
                          onCheckedChange={(checked) =>
                            setSupplierForm((prev) => ({
                              ...prev,
                              isWhatsAppSame: checked === true,
                              whatsappNumber: checked === true ? prev.phone : prev.whatsappNumber,
                            }))
                          }
                        />
                        <Label
                          htmlFor="supp-whatsapp-same"
                          className="cursor-pointer font-normal text-xs text-[#202428] leading-tight select-none"
                        >
                          WhatsApp number is same as supplier number
                        </Label>
                      </div>
                    </div>

                    {/* 4. Conditional WhatsApp Number Field */}
                    {!supplierForm.isWhatsAppSame && (
                      <div className="printpal-form-group printpal-whatsapp-field-enter">
                        <Label className="printpal-form-label" htmlFor="supp-whatsapp">
                          WhatsApp Number
                        </Label>
                        <Input
                          id="supp-whatsapp"
                          type="tel"
                          placeholder="e.g. 98400 12345"
                          className="printpal-form-input"
                          value={supplierForm.whatsappNumber}
                          onChange={(e) =>
                            setSupplierForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                          }
                        />
                      </div>
                    )}

                    {/* 5. Email Address */}
                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="supp-email">
                        Email Address
                      </Label>
                      <Input
                        id="supp-email"
                        type="email"
                        placeholder="e.g. rajesh@mehtaacrylics.com"
                        className="printpal-form-input"
                        value={supplierForm.email}
                        onChange={(e) =>
                          setSupplierForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                      />
                    </div>

                    {/* 6. Description / Notes Box */}
                    <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                      <Label className="printpal-form-label" htmlFor="supp-notes">
                        Supplier Description / Notes
                      </Label>
                      <Textarea
                        id="supp-notes"
                        placeholder="Add internal vendor notes, specializations, business hours..."
                        className="min-h-[72px] text-[13px] border-[#DCE1E5] bg-white text-[#202428] placeholder:text-[#737B84] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0]"
                        value={supplierForm.notes}
                        onChange={(e) =>
                          setSupplierForm((prev) => ({ ...prev, notes: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  {/* ── Right Column: Cards (780px Flexible) ── */}
                  <div className="printpal-right-column">
                    <div className="printpal-sites-scroll-area">
                      <div className="printpal-sites-wrapper">
                        {/* ── Card 1: Supplier Address ── */}
                        <div className="printpal-site-card">
                          <div className="printpal-site-card-header cursor-default">
                            <div className="printpal-site-card-title">
                              <span className="text-[13px] font-semibold text-[#202428]">
                                Supplier Address
                              </span>
                            </div>
                          </div>

                          <div className="printpal-site-card-body">
                            <div className="printpal-site-info-fields" style={{ padding: "16px 16px 16px 16px" }}>
                              {/* Address Line 1 & Address Line 2 */}
                              <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
                                <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                  <Label className="printpal-form-label" htmlFor="supp-addr1">
                                    Address Line 1 <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="supp-addr1"
                                    placeholder="e.g. No. 12 Industrial Estate"
                                    className={`printpal-form-input ${supplierErrors.addressLine1 ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                                    value={supplierForm.addressLine1}
                                    onChange={(e) => {
                                      const line1 = e.target.value
                                      setSupplierForm((prev) => ({
                                        ...prev,
                                        addressLine1: line1,
                                        address: [line1, prev.addressLine2].filter(Boolean).join(", "),
                                      }))
                                      if (supplierErrors.addressLine1) {
                                        setSupplierErrors((prev) => {
                                          const n = { ...prev }
                                          delete n.addressLine1
                                          return n
                                        })
                                      }
                                    }}
                                  />
                                  {supplierErrors.addressLine1 && (
                                    <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                                      <AlertCircle className="h-3 w-3 shrink-0" />
                                      {supplierErrors.addressLine1}
                                    </span>
                                  )}
                                </div>

                                <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                  <Label className="printpal-form-label" htmlFor="supp-addr2">
                                    Address Line 2
                                  </Label>
                                  <Input
                                    id="supp-addr2"
                                    placeholder="e.g. 3rd Cross Street, Guindy"
                                    className="printpal-form-input"
                                    value={supplierForm.addressLine2}
                                    onChange={(e) => {
                                      const line2 = e.target.value
                                      setSupplierForm((prev) => ({
                                        ...prev,
                                        addressLine2: line2,
                                        address: [prev.addressLine1, line2].filter(Boolean).join(", "),
                                      }))
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="printpal-form-row-3" style={{ marginBottom: 0 }}>
                                <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                  <Label className="printpal-form-label" htmlFor="supp-city">City</Label>
                                  <Input
                                    id="supp-city"
                                    placeholder="Chennai"
                                    className="printpal-form-input"
                                    value={supplierForm.city}
                                    onChange={(e) =>
                                      setSupplierForm((prev) => ({ ...prev, city: e.target.value }))
                                    }
                                  />
                                </div>
                                <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                  <Label className="printpal-form-label" htmlFor="supp-state">State</Label>
                                  <Input
                                    id="supp-state"
                                    placeholder="Tamil Nadu"
                                    className="printpal-form-input"
                                    value={supplierForm.state}
                                    onChange={(e) =>
                                      setSupplierForm((prev) => ({ ...prev, state: e.target.value }))
                                    }
                                  />
                                </div>
                                <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                  <Label className="printpal-form-label" htmlFor="supp-pincode">Pincode</Label>
                                  <Input
                                    id="supp-pincode"
                                    placeholder="600032"
                                    className="printpal-form-input"
                                    value={supplierForm.pincode}
                                    onChange={(e) =>
                                      setSupplierForm((prev) => ({ ...prev, pincode: e.target.value }))
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ── Card 2: Services & Locations Served (Merged) ── */}
                        <div className="printpal-site-card">
                          <div className="printpal-site-card-header cursor-default">
                            <div className="printpal-site-card-title">
                              <span className="text-[13px] font-semibold text-[#202428]">
                                Services & Locations Served
                              </span>
                            </div>
                          </div>

                          <div className="printpal-site-card-body">
                            <div className="printpal-site-info-fields" style={{ padding: "16px 16px 16px 16px" }}>
                              {/* 1. What Services / Materials They Provide */}
                              <div className="printpal-form-group" style={{ marginBottom: "16px" }}>
                                <Label className="printpal-form-label">
                                  What Services / Materials They Provide <span className="text-red-500">*</span>
                                </Label>

                                <Popover open={servicesDropdownOpen} onOpenChange={setServicesDropdownOpen}>
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className={`printpal-form-input flex items-center justify-between cursor-pointer w-full text-left ${supplierErrors.category ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                                    >
                                      <span className={selectedServices.length > 0 ? "text-[#202428] font-medium text-[13px]" : "text-[#737B84] text-[13px]"}>
                                        {selectedServices.length === 0
                                          ? "Select services & supplies provided..."
                                          : `${selectedServices.length} service${selectedServices.length > 1 ? "s" : ""} selected`}
                                      </span>
                                      <ChevronDown className="h-4 w-4 text-[#737B84] shrink-0" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    align="start"
                                    sideOffset={4}
                                    className="w-[520px] max-w-[calc(100vw-40px)] p-0 bg-white border border-[#DCE1E5] shadow-xl rounded-lg overflow-hidden z-[9999]"
                                  >
                                    <div className="flex items-center gap-2.5 border-b border-[#DCE1E5] px-3 h-[46px] bg-[#F8FAFC] rounded-t-lg w-full box-border overflow-hidden">
                                      <Search className="h-4 w-4 text-[#737B84] shrink-0" />
                                      <input
                                        type="text"
                                        placeholder="Search services or type custom..."
                                        value={servicesSearchQuery}
                                        onChange={(e) => setServicesSearchQuery(e.target.value)}
                                        className="flex-1 min-w-0 h-full text-[13px] text-[#202428] placeholder:text-[#737B84] outline-none bg-transparent"
                                      />
                                      {servicesSearchQuery && (
                                        <button
                                          type="button"
                                          onClick={() => setServicesSearchQuery("")}
                                          className="text-[#737B84] hover:text-[#202428] shrink-0 p-1 cursor-pointer"
                                          title="Clear search"
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>
                                    <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                                      {filteredServices.map((service) => {
                                        const isChecked = selectedServices.includes(service)
                                        return (
                                          <div
                                            key={service}
                                            onClick={() => toggleService(service)}
                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer text-xs select-none transition-colors ${isChecked ? "bg-[#D7440E]/5 text-[#202428] font-medium" : "text-[#202428] hover:bg-[#F3F5F7]"
                                              }`}
                                          >
                                            <Checkbox
                                              checked={isChecked}
                                              onCheckedChange={() => toggleService(service)}
                                            />
                                            <span className="flex-1">{service}</span>
                                          </div>
                                        )
                                      })}
                                      {servicesSearchQuery.trim() && !filteredServices.some(s => s.toLowerCase() === servicesSearchQuery.trim().toLowerCase()) && (
                                        <div
                                          onClick={() => {
                                            toggleService(servicesSearchQuery.trim())
                                            setServicesSearchQuery("")
                                          }}
                                          className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-xs text-[#D7440E] hover:bg-[#D7440E]/10 font-medium"
                                        >
                                          <Plus className="h-3.5 w-3.5" />
                                          <span>Add "{servicesSearchQuery.trim()}" as custom service</span>
                                        </div>
                                      )}
                                    </div>
                                  </PopoverContent>
                                </Popover>

                                {supplierErrors.category && (
                                  <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                                    <AlertCircle className="h-3 w-3 shrink-0" />
                                    {supplierErrors.category}
                                  </span>
                                )}

                                {/* Small Selected Chips with 'x' */}
                                {selectedServices.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                                    {selectedServices.map((service) => (
                                      <span
                                        key={service}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#F3F5F7] border border-[#DCE1E5] text-[#202428] hover:border-[#b5bfc7]"
                                      >
                                        <span>{service}</span>
                                        <button
                                          type="button"
                                          onClick={() => toggleService(service)}
                                          className="text-[#737B84] hover:text-red-500 rounded-full transition-colors cursor-pointer"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* 2. Serving Regions & Delivery Coverage */}
                              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                <Label className="printpal-form-label">
                                  Serving Regions & Delivery Coverage
                                </Label>

                                <Popover open={locationsDropdownOpen} onOpenChange={setLocationsDropdownOpen}>
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className="printpal-form-input flex items-center justify-between cursor-pointer w-full text-left"
                                    >
                                      <span className={selectedLocations.length > 0 ? "text-[#202428] font-medium text-[13px]" : "text-[#737B84] text-[13px]"}>
                                        {selectedLocations.length === 0
                                          ? "Select delivery regions & coverage..."
                                          : `${selectedLocations.length} region${selectedLocations.length > 1 ? "s" : ""} selected`}
                                      </span>
                                      <ChevronDown className="h-4 w-4 text-[#737B84] shrink-0" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    align="start"
                                    sideOffset={4}
                                    className="w-[520px] max-w-[calc(100vw-40px)] p-0 bg-white border border-[#DCE1E5] shadow-xl rounded-lg overflow-hidden z-[9999]"
                                  >
                                    <div className="flex items-center gap-2.5 border-b border-[#DCE1E5] px-3 h-[46px] bg-[#F8FAFC] rounded-t-lg w-full box-border overflow-hidden">
                                      <Search className="h-4 w-4 text-[#737B84] shrink-0" />
                                      <input
                                        type="text"
                                        placeholder="Search cities, districts, regions..."
                                        value={locationsSearchQuery}
                                        onChange={(e) => setLocationsSearchQuery(e.target.value)}
                                        className="flex-1 min-w-0 h-full text-[13px] text-[#202428] placeholder:text-[#737B84] outline-none bg-transparent"
                                      />
                                      {locationsSearchQuery && (
                                        <button
                                          type="button"
                                          onClick={() => setLocationsSearchQuery("")}
                                          className="text-[#737B84] hover:text-[#202428] shrink-0 p-1 cursor-pointer"
                                          title="Clear search"
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>
                                    <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                                      {filteredLocations.map((loc) => {
                                        const isChecked = selectedLocations.includes(loc)
                                        return (
                                          <div
                                            key={loc}
                                            onClick={() => toggleLocation(loc)}
                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer text-xs select-none transition-colors ${isChecked ? "bg-[#D7440E]/5 text-[#202428] font-medium" : "text-[#202428] hover:bg-[#F3F5F7]"
                                              }`}
                                          >
                                            <Checkbox
                                              checked={isChecked}
                                              onCheckedChange={() => toggleLocation(loc)}
                                            />
                                            <span className="flex-1">{loc}</span>
                                          </div>
                                        )
                                      })}
                                      {locationsSearchQuery.trim() && !filteredLocations.some(l => l.toLowerCase() === locationsSearchQuery.trim().toLowerCase()) && (
                                        <div
                                          onClick={() => {
                                            toggleLocation(locationsSearchQuery.trim())
                                            setLocationsSearchQuery("")
                                          }}
                                          className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-xs text-[#D7440E] hover:bg-[#D7440E]/10 font-medium"
                                        >
                                          <Plus className="h-3.5 w-3.5" />
                                          <span>Add "{locationsSearchQuery.trim()}" as custom region</span>
                                        </div>
                                      )}
                                    </div>
                                  </PopoverContent>
                                </Popover>

                                {/* Small Selected Location Chips with 'x' */}
                                {selectedLocations.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                                    {selectedLocations.map((loc) => (
                                      <span
                                        key={loc}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#F3F5F7] border border-[#DCE1E5] text-[#202428] hover:border-[#b5bfc7]"
                                      >
                                        <span>{loc}</span>
                                        <button
                                          type="button"
                                          onClick={() => toggleLocation(loc)}
                                          className="text-[#737B84] hover:text-red-500 rounded-full transition-colors cursor-pointer"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ── Card 4: Billing Address & Shipping Address ── */}
                        <div className="printpal-site-card">
                          <div className="printpal-site-card-header cursor-default">
                            <div className="printpal-site-card-title">
                              <span className="text-[13px] font-semibold text-[#202428]">
                                Billing Address & Shipping Address
                              </span>
                            </div>
                          </div>

                          <div className="printpal-site-card-body">
                            <div className="printpal-site-info-fields" style={{ padding: "16px 16px 16px 16px" }}>
                              <div className="font-semibold text-xs text-[#202428] uppercase tracking-wider mb-3">
                                Registered Billing Details
                              </div>

                              <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
                                <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                  <Label className="printpal-form-label" htmlFor="supp-gstin">
                                    GSTIN (Tax ID)
                                  </Label>
                                  <Input
                                    id="supp-gstin"
                                    placeholder="33AAACA1234A1Z5"
                                    className="printpal-form-input uppercase"
                                    value={supplierForm.gstin}
                                    onChange={(e) =>
                                      setSupplierForm((prev) => ({
                                        ...prev,
                                        gstin: e.target.value.toUpperCase(),
                                      }))
                                    }
                                  />
                                </div>

                                <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                  <Label className="printpal-form-label" htmlFor="supp-payment-terms">
                                    Payment Terms
                                  </Label>
                                  <Select
                                    value={supplierForm.paymentTerms || "ADVANCE"}
                                    onValueChange={(val) =>
                                      setSupplierForm((prev) => ({ ...prev, paymentTerms: val }))
                                    }
                                  >
                                    <SelectTrigger id="supp-payment-terms" className="w-full h-9 bg-white border-[#DCE1E5] text-[13px] text-[#202428] hover:border-[#b5bfc7] focus:border-[#2878D0] focus:ring-0 focus-visible:ring-1 focus-visible:ring-[#2878D0] data-[state=open]:border-[#2878D0]">
                                      <SelectValue placeholder="Select terms..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-[#DCE1E5] shadow-lg rounded-md z-[9999]">
                                      <SelectItem value="ADVANCE">100% Advance Payment</SelectItem>
                                      <SelectItem value="ADVANCE_50">50% Advance / 50% on Delivery</SelectItem>
                                      <SelectItem value="NET_15">Net 15 Days Credit</SelectItem>
                                      <SelectItem value="NET_30">Net 30 Days Credit</SelectItem>
                                      <SelectItem value="COD">Cash on Delivery (COD)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="printpal-form-group" style={{ marginBottom: "16px" }}>
                                <div className="printpal-checkbox-label" style={{ marginTop: 0 }}>
                                  <Checkbox
                                    id="supp-billing-same"
                                    checked={supplierForm.isBillingSameAsWarehouse !== false}
                                    onCheckedChange={(checked) =>
                                      setSupplierForm((prev) => ({
                                        ...prev,
                                        isBillingSameAsWarehouse: checked === true,
                                        billingAddressLine1: checked === true ? prev.addressLine1 : prev.billingAddressLine1,
                                        billingAddressLine2: checked === true ? prev.addressLine2 : prev.billingAddressLine2,
                                        billingCity: checked === true ? prev.city : prev.billingCity,
                                        billingState: checked === true ? prev.state : prev.billingState,
                                        billingPincode: checked === true ? prev.pincode : prev.billingPincode,
                                        billingAddress: checked === true ? prev.address : prev.billingAddress,
                                      }))
                                    }
                                  />
                                  <Label
                                    htmlFor="supp-billing-same"
                                    className="cursor-pointer font-normal text-xs text-[#202428] leading-tight select-none"
                                  >
                                    Billing address is same as supplier dispatch address
                                  </Label>
                                </div>

                                {!supplierForm.isBillingSameAsWarehouse && (
                                  <div className="mt-3 printpal-whatsapp-field-enter">
                                    <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
                                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                        <Label className="printpal-form-label" htmlFor="supp-billing-addr1">
                                          Address Line 1 <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                          id="supp-billing-addr1"
                                          placeholder="e.g. Registered Corporate Office, Plot No. 45"
                                          className="printpal-form-input"
                                          value={supplierForm.billingAddressLine1}
                                          onChange={(e) => {
                                            const l1 = e.target.value
                                            setSupplierForm((prev) => ({
                                              ...prev,
                                              billingAddressLine1: l1,
                                              billingAddress: [l1, prev.billingAddressLine2, prev.billingCity, prev.billingState, prev.billingPincode].filter(Boolean).join(", "),
                                            }))
                                          }}
                                        />
                                      </div>
                                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                        <Label className="printpal-form-label" htmlFor="supp-billing-addr2">
                                          Address Line 2
                                        </Label>
                                        <Input
                                          id="supp-billing-addr2"
                                          placeholder="e.g. Business Tower, Mount Road"
                                          className="printpal-form-input"
                                          value={supplierForm.billingAddressLine2}
                                          onChange={(e) => {
                                            const l2 = e.target.value
                                            setSupplierForm((prev) => ({
                                              ...prev,
                                              billingAddressLine2: l2,
                                              billingAddress: [prev.billingAddressLine1, l2, prev.billingCity, prev.billingState, prev.billingPincode].filter(Boolean).join(", "),
                                            }))
                                          }}
                                        />
                                      </div>
                                    </div>

                                    <div className="printpal-form-row-3" style={{ marginBottom: 0 }}>
                                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                        <Label className="printpal-form-label" htmlFor="supp-billing-city">City</Label>
                                        <Input
                                          id="supp-billing-city"
                                          placeholder="Chennai"
                                          className="printpal-form-input"
                                          value={supplierForm.billingCity}
                                          onChange={(e) => {
                                            const c = e.target.value
                                            setSupplierForm((prev) => ({
                                              ...prev,
                                              billingCity: c,
                                              billingAddress: [prev.billingAddressLine1, prev.billingAddressLine2, c, prev.billingState, prev.billingPincode].filter(Boolean).join(", "),
                                            }))
                                          }}
                                        />
                                      </div>
                                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                        <Label className="printpal-form-label" htmlFor="supp-billing-state">State</Label>
                                        <Input
                                          id="supp-billing-state"
                                          placeholder="Tamil Nadu"
                                          className="printpal-form-input"
                                          value={supplierForm.billingState}
                                          onChange={(e) => {
                                            const s = e.target.value
                                            setSupplierForm((prev) => ({
                                              ...prev,
                                              billingState: s,
                                              billingAddress: [prev.billingAddressLine1, prev.billingAddressLine2, prev.billingCity, s, prev.billingPincode].filter(Boolean).join(", "),
                                            }))
                                          }}
                                        />
                                      </div>
                                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                        <Label className="printpal-form-label" htmlFor="supp-billing-pincode">Pincode</Label>
                                        <Input
                                          id="supp-billing-pincode"
                                          placeholder="600002"
                                          className="printpal-form-input"
                                          value={supplierForm.billingPincode}
                                          onChange={(e) => {
                                            const p = e.target.value
                                            setSupplierForm((prev) => ({
                                              ...prev,
                                              billingPincode: p,
                                              billingAddress: [prev.billingAddressLine1, prev.billingAddressLine2, prev.billingCity, prev.billingState, p].filter(Boolean).join(", "),
                                            }))
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Shipping Address (PrintPal Workshop User Address) */}
                              <div className="border-t border-[#DCE1E5] pt-4 mt-2">
                                <div className="font-semibold text-xs text-[#202428] uppercase tracking-wider mb-2">
                                  Shipping / Delivery Address
                                </div>
                                <p className="text-xs text-[#737B84] mb-3">
                                  Destination where materials and supplies ordered from this vendor will be received.
                                </p>

                                <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                  <div className="printpal-checkbox-label" style={{ marginTop: 0 }}>
                                    <Checkbox
                                      id="supp-shipping-same"
                                      checked={supplierForm.isShippingSameAsBilling !== false}
                                      onCheckedChange={(checked) =>
                                        setSupplierForm((prev) => ({
                                          ...prev,
                                          isShippingSameAsBilling: checked === true,
                                          shippingAddressLine1: checked === true ? (prev.isBillingSameAsWarehouse ? prev.addressLine1 : prev.billingAddressLine1) : prev.shippingAddressLine1,
                                          shippingAddressLine2: checked === true ? (prev.isBillingSameAsWarehouse ? prev.addressLine2 : prev.billingAddressLine2) : prev.shippingAddressLine2,
                                          shippingCity: checked === true ? (prev.isBillingSameAsWarehouse ? prev.city : prev.billingCity) : prev.shippingCity,
                                          shippingState: checked === true ? (prev.isBillingSameAsWarehouse ? prev.state : prev.billingState) : prev.shippingState,
                                          shippingPincode: checked === true ? (prev.isBillingSameAsWarehouse ? prev.pincode : prev.billingPincode) : prev.shippingPincode,
                                          shippingAddress: checked === true
                                            ? (prev.isBillingSameAsWarehouse ? prev.address : prev.billingAddress)
                                            : prev.shippingAddress,
                                        }))
                                      }
                                    />
                                    <Label
                                      htmlFor="supp-shipping-same"
                                      className="cursor-pointer font-normal text-xs text-[#202428] leading-tight select-none"
                                    >
                                      Shipping address is same as billing address (PrintPal Workshop Hub)
                                    </Label>
                                  </div>

                                  {!supplierForm.isShippingSameAsBilling && (
                                    <div className="mt-3 printpal-whatsapp-field-enter">
                                      <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
                                        <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                          <Label className="printpal-form-label" htmlFor="supp-shipping-addr1">
                                            Address Line 1 <span className="text-red-500">*</span>
                                          </Label>
                                          <Input
                                            id="supp-shipping-addr1"
                                            placeholder="e.g. PrintPal Workshop & Factory, No. 8"
                                            className="printpal-form-input"
                                            value={supplierForm.shippingAddressLine1}
                                            onChange={(e) => {
                                              const l1 = e.target.value
                                              setSupplierForm((prev) => ({
                                                ...prev,
                                                shippingAddressLine1: l1,
                                                shippingAddress: [l1, prev.shippingAddressLine2, prev.shippingCity, prev.shippingState, prev.shippingPincode].filter(Boolean).join(", "),
                                              }))
                                            }}
                                          />
                                        </div>
                                        <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                          <Label className="printpal-form-label" htmlFor="supp-shipping-addr2">
                                            Address Line 2
                                          </Label>
                                          <Input
                                            id="supp-shipping-addr2"
                                            placeholder="e.g. SIDCO Industrial Estate, Guindy"
                                            className="printpal-form-input"
                                            value={supplierForm.shippingAddressLine2}
                                            onChange={(e) => {
                                              const l2 = e.target.value
                                              setSupplierForm((prev) => ({
                                                ...prev,
                                                shippingAddressLine2: l2,
                                                shippingAddress: [prev.shippingAddressLine1, l2, prev.shippingCity, prev.shippingState, prev.shippingPincode].filter(Boolean).join(", "),
                                              }))
                                            }}
                                          />
                                        </div>
                                      </div>

                                      <div className="printpal-form-row-3" style={{ marginBottom: 0 }}>
                                        <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                          <Label className="printpal-form-label" htmlFor="supp-shipping-city">City</Label>
                                          <Input
                                            id="supp-shipping-city"
                                            placeholder="Chennai"
                                            className="printpal-form-input"
                                            value={supplierForm.shippingCity}
                                            onChange={(e) => {
                                              const c = e.target.value
                                              setSupplierForm((prev) => ({
                                                ...prev,
                                                shippingCity: c,
                                                shippingAddress: [prev.shippingAddressLine1, prev.shippingAddressLine2, c, prev.shippingState, prev.shippingPincode].filter(Boolean).join(", "),
                                              }))
                                            }}
                                          />
                                        </div>
                                        <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                          <Label className="printpal-form-label" htmlFor="supp-shipping-state">State</Label>
                                          <Input
                                            id="supp-shipping-state"
                                            placeholder="Tamil Nadu"
                                            className="printpal-form-input"
                                            value={supplierForm.shippingState}
                                            onChange={(e) => {
                                              const s = e.target.value
                                              setSupplierForm((prev) => ({
                                                ...prev,
                                                shippingState: s,
                                                shippingAddress: [prev.shippingAddressLine1, prev.shippingAddressLine2, prev.shippingCity, s, prev.shippingPincode].filter(Boolean).join(", "),
                                              }))
                                            }}
                                          />
                                        </div>
                                        <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                          <Label className="printpal-form-label" htmlFor="supp-shipping-pincode">Pincode</Label>
                                          <Input
                                            id="supp-shipping-pincode"
                                            placeholder="600032"
                                            className="printpal-form-input"
                                            value={supplierForm.shippingPincode}
                                            onChange={(e) => {
                                              const p = e.target.value
                                              setSupplierForm((prev) => ({
                                                ...prev,
                                                shippingPincode: p,
                                                shippingAddress: [prev.shippingAddressLine1, prev.shippingAddressLine2, prev.shippingCity, prev.shippingState, p].filter(Boolean).join(", "),
                                              }))
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : drawerTitle.includes("Product") ? (
              /* Product Form: First single centered top card, below 2-panel layout (Left: Finishes, Right: Materials) */
              <div className="w-full h-full min-h-0 flex flex-col items-center overflow-hidden">
                {Object.keys(productErrors).length > 0 && (
                  <div className="flex-shrink-0 flex items-center gap-2 p-2.5 mb-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium max-w-[1080px] w-full mx-auto">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <span>Please resolve the errors marked below to save the product.</span>
                  </div>
                )}

                <div className="flex-1 min-h-0 w-full max-w-[1080px] mx-auto flex flex-col gap-3.5 overflow-hidden">
                  {/* ── Card 1: Product Details (Single Centered Card, Increased Width) ── */}
                  <div className="flex-shrink-0 bg-white border border-[#DCE1E5] rounded-[12px] p-2 box-border shadow-none">
                    <div className="flex items-center justify-between h-9 px-3.5 bg-[#F3F5F7] rounded-[8px] mb-2.5">
                      <span className="text-[13px] font-semibold text-[#202428]">
                        Product Details
                      </span>
                    </div>

                    <div className="p-2 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      {/* 1. Product Name */}
                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                        <Label className="printpal-form-label text-xs font-medium text-[#344054]" htmlFor="prod-title">
                          Product Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="prod-title"
                          placeholder="e.g. Front-Lit Channel Letters"
                          className={`h-9 text-xs border-[#DCE1E5] bg-white text-[#202428] placeholder:text-[#94A3B8] focus:border-[#2878D0] ${productErrors.title ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""
                            }`}
                          value={productForm.title}
                          onChange={(e) => {
                            setProductForm((prev) => ({ ...prev, title: e.target.value }))
                            if (productErrors.title) {
                              setProductErrors((prev) => {
                                const n = { ...prev }
                                delete n.title
                                return n
                              })
                            }
                          }}
                        />
                        {productErrors.title && (
                          <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {productErrors.title}
                          </span>
                        )}
                      </div>

                      {/* 2. Description */}
                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                        <Label className="printpal-form-label text-xs font-medium text-[#344054]" htmlFor="prod-desc">
                          Description
                        </Label>
                        <Input
                          id="prod-desc"
                          placeholder="e.g. Individual 3D letters with a glowing front face..."
                          className="h-9 text-xs border-[#DCE1E5] bg-white text-[#202428] placeholder:text-[#94A3B8] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0]"
                          value={productForm.description}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Two-Panel Layout: Left = Finishes, Right = Materials ── */}
                  <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 w-full overflow-hidden">
                    {/* ── Left Panel: Finishes can be done ── */}
                    <div className="h-full min-h-0 flex flex-col bg-white border border-[#DCE1E5] rounded-[12px] p-2 box-border shadow-none overflow-hidden">
                      {/* Header */}
                      <div className="flex-shrink-0 flex items-center justify-between h-9 px-3.5 bg-[#F3F5F7] rounded-[8px] mb-2.5">
                        <span className="text-[13px] font-semibold text-[#202428]">
                          Finishes can be done
                        </span>
                        {productForm.finishIds.length > 0 && (
                          <span className="text-[11px] font-medium text-[#737B84]">
                            {productForm.finishIds.length} selected
                          </span>
                        )}
                      </div>

                      {/* Card Body: Flex column taking 100% remaining space */}
                      <div className="flex-1 min-h-0 flex flex-col p-2 pt-0 overflow-hidden">
                        {/* Selected Chips */}
                        {productForm.finishIds.length > 0 && (
                          <div className="flex-shrink-0 flex flex-wrap gap-1.5 mb-2.5 max-h-[56px] overflow-y-auto printpal-compact-scroll">
                            {productForm.finishIds.map((finId) => {
                              const fin = finishes.find((f) => f.id === finId)
                              return (
                                <span key={finId} className="printpal-chip">
                                  <span>{fin?.name || finId}</span>
                                  <button
                                    type="button"
                                    className="printpal-chip-remove"
                                    title={`Remove ${fin?.name || finId}`}
                                    onClick={() => {
                                      setProductForm((prev) => ({
                                        ...prev,
                                        finishIds: prev.finishIds.filter((id) => id !== finId),
                                      }))
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              )
                            })}
                          </div>
                        )}

                        {/* Search bar & Add Button */}
                        <div className="flex-shrink-0 flex items-center gap-2 mb-2.5">
                          <div className="relative flex-1">
                            <Search className="h-4 w-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder={`Search ${finishes.length} master finishes...`}
                              value={finishesSearchInDrawer}
                              onChange={(e) => setFinishesSearchInDrawer(e.target.value)}
                              className="w-full h-[44px] pl-9 pr-8 text-xs bg-white border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#2878D0]"
                            />
                            {finishesSearchInDrawer && (
                              <button
                                type="button"
                                onClick={() => setFinishesSearchInDrawer("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737B84] hover:text-[#202428] cursor-pointer p-1"
                                title="Clear search"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            className="h-[44px] px-3.5 text-xs font-medium border border-[#D7440E] text-[#D7440E] bg-transparent hover:bg-[#D7440E]/10 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-none"
                            onClick={() => openFinishPrompt()}
                          >
                            Add
                          </button>
                        </div>

                        {/* Options Checklist: Maximize height, internal scroll only */}
                        <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll border border-[#E2E8F0] rounded-lg p-2 bg-[#F8FAFC] space-y-1">
                          {finishes
                            .filter((f) =>
                              !finishesSearchInDrawer.trim() ||
                              f.name.toLowerCase().includes(finishesSearchInDrawer.toLowerCase()) ||
                              (f.type || "").toLowerCase().includes(finishesSearchInDrawer.toLowerCase())
                            )
                            .map((fin) => {
                              const isSelected = productForm.finishIds.includes(fin.id)
                              return (
                                <div
                                  key={fin.id}
                                  onClick={() => {
                                    setProductForm((prev) => ({
                                      ...prev,
                                      finishIds: isSelected
                                        ? prev.finishIds.filter((id) => id !== fin.id)
                                        : [...prev.finishIds, fin.id],
                                    }))
                                  }}
                                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer select-none transition-colors ${isSelected ? "bg-[#EFF6FF] text-[#1E40AF] font-medium" : "hover:bg-white text-[#334155]"
                                    }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Checkbox
                                      id={`prod-fin-${fin.id}`}
                                      checked={isSelected}
                                      onCheckedChange={() => {
                                        setProductForm((prev) => ({
                                          ...prev,
                                          finishIds: isSelected
                                            ? prev.finishIds.filter((id) => id !== fin.id)
                                            : [...prev.finishIds, fin.id],
                                        }))
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <label htmlFor={`prod-fin-${fin.id}`} className="cursor-pointer">
                                      {fin.name}
                                    </label>
                                  </div>
                                  <span className="text-[11px] text-[#94A3B8] font-normal">{fin.type}</span>
                                </div>
                              )
                            })}
                          {finishes.filter((f) =>
                            !finishesSearchInDrawer.trim() ||
                            f.name.toLowerCase().includes(finishesSearchInDrawer.toLowerCase()) ||
                            (f.type || "").toLowerCase().includes(finishesSearchInDrawer.toLowerCase())
                          ).length === 0 && (
                              <p className="text-xs text-[#94A3B8] text-center py-4">No finishes found.</p>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* ── Right Panel: Materials can be used ── */}
                    <div className="h-full min-h-0 flex flex-col bg-white border border-[#DCE1E5] rounded-[12px] p-2 box-border shadow-none overflow-hidden">
                      {/* Header */}
                      <div className="flex-shrink-0 flex items-center justify-between h-9 px-3.5 bg-[#F3F5F7] rounded-[8px] mb-2.5">
                        <span className="text-[13px] font-semibold text-[#202428]">
                          Materials can be used
                        </span>
                        {productForm.materialIds.length > 0 && (
                          <span className="text-[11px] font-medium text-[#737B84]">
                            {productForm.materialIds.length} selected
                          </span>
                        )}
                      </div>

                      {/* Card Body: Flex column taking 100% remaining space */}
                      <div className="flex-1 min-h-0 flex flex-col p-2 pt-0 overflow-hidden">
                        {/* Selected Chips */}
                        {productForm.materialIds.length > 0 && (
                          <div className="flex-shrink-0 flex flex-wrap gap-1.5 mb-2.5 max-h-[56px] overflow-y-auto printpal-compact-scroll">
                            {productForm.materialIds.map((matId) => {
                              const mat = materials.find((m) => m.id === matId)
                              return (
                                <span key={matId} className="printpal-chip">
                                  <span>{mat?.name || matId}</span>
                                  <button
                                    type="button"
                                    className="printpal-chip-remove"
                                    title={`Remove ${mat?.name || matId}`}
                                    onClick={() => {
                                      setProductForm((prev) => ({
                                        ...prev,
                                        materialIds: prev.materialIds.filter((id) => id !== matId),
                                      }))
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              )
                            })}
                          </div>
                        )}

                        {/* Search bar & Add Button */}
                        <div className="flex-shrink-0 flex items-center gap-2 mb-2.5">
                          <div className="relative flex-1">
                            <Search className="h-4 w-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder={`Search ${materials.length} master materials...`}
                              value={materialsSearchInDrawer}
                              onChange={(e) => setMaterialsSearchInDrawer(e.target.value)}
                              className="w-full h-[44px] pl-9 pr-8 text-xs bg-white border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#2878D0]"
                            />
                            {materialsSearchInDrawer && (
                              <button
                                type="button"
                                onClick={() => setMaterialsSearchInDrawer("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737B84] hover:text-[#202428] cursor-pointer p-1"
                                title="Clear search"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            className="h-[44px] px-3.5 text-xs font-medium border border-[#D7440E] text-[#D7440E] bg-transparent hover:bg-[#D7440E]/10 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-none"
                            onClick={() => openMaterialPrompt()}
                          >
                            Add
                          </button>
                        </div>

                        {/* Options Checklist: Maximize height, internal scroll only */}
                        <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll border border-[#E2E8F0] rounded-lg p-2 bg-[#F8FAFC] space-y-1">
                          {materials
                            .filter((m) =>
                              !materialsSearchInDrawer.trim() ||
                              m.name.toLowerCase().includes(materialsSearchInDrawer.toLowerCase()) ||
                              (m.category || "").toLowerCase().includes(materialsSearchInDrawer.toLowerCase())
                            )
                            .map((mat) => {
                              const isSelected = productForm.materialIds.includes(mat.id)
                              return (
                                <div
                                  key={mat.id}
                                  onClick={() => {
                                    setProductForm((prev) => ({
                                      ...prev,
                                      materialIds: isSelected
                                        ? prev.materialIds.filter((id) => id !== mat.id)
                                        : [...prev.materialIds, mat.id],
                                    }))
                                  }}
                                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer select-none transition-colors ${isSelected ? "bg-[#EFF6FF] text-[#1E40AF] font-medium" : "hover:bg-white text-[#334155]"
                                    }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Checkbox
                                      id={`prod-mat-${mat.id}`}
                                      checked={isSelected}
                                      onCheckedChange={() => {
                                        setProductForm((prev) => ({
                                          ...prev,
                                          materialIds: isSelected
                                            ? prev.materialIds.filter((id) => id !== mat.id)
                                            : [...prev.materialIds, mat.id],
                                        }))
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <label htmlFor={`prod-mat-${mat.id}`} className="cursor-pointer">
                                      {mat.name}
                                    </label>
                                  </div>
                                  <span className="text-[11px] text-[#94A3B8] font-normal">{mat.category}</span>
                                </div>
                              )
                            })}
                          {materials.filter((m) =>
                            !materialsSearchInDrawer.trim() ||
                            m.name.toLowerCase().includes(materialsSearchInDrawer.toLowerCase()) ||
                            (m.category || "").toLowerCase().includes(materialsSearchInDrawer.toLowerCase())
                          ).length === 0 && (
                              <p className="text-xs text-[#94A3B8] text-center py-4">No materials found.</p>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : drawerTitle.includes("Material") ? (
              /* Material Form in 2-Column Desktop Spec */
              <div className="printpal-new-cust-grid-wrapper">
                {Object.keys(materialErrors).length > 0 && (
                  <div className="flex items-center gap-2 p-3 mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <span>Please resolve the errors marked below to save the material.</span>
                  </div>
                )}

                <div className="printpal-new-cust-grid">
                  {/* Left Column Card: Basic Material Details (300px Fixated) */}
                  <div className="printpal-card-basic-details">
                    <div className="printpal-card-title">Material Details</div>

                    {/* 1. Material Name */}
                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="mat-name">
                        Material Name / Grade <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="mat-name"
                        placeholder="e.g. Cast Acrylic Sheet (Opal White 433)"
                        className={`printpal-form-input ${materialErrors.name ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                        value={materialForm.name}
                        onChange={(e) => {
                          setMaterialForm((prev) => ({ ...prev, name: e.target.value }))
                          if (materialErrors.name) {
                            setMaterialErrors((prev) => {
                              const n = { ...prev }
                              delete n.name
                              return n
                            })
                          }
                        }}
                      />
                      {materialErrors.name && (
                        <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {materialErrors.name}
                        </span>
                      )}
                    </div>

                    {/* 2. Substrate Category */}
                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="mat-category">
                        Substrate Category
                      </Label>
                      <select
                        id="mat-category"
                        className="printpal-form-input h-9 text-[13px] bg-white cursor-pointer"
                        value={materialForm.category}
                        onChange={(e) => setMaterialForm((prev) => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="Acrylic & Diffusers">Acrylic & Diffusers</option>
                        <option value="ACP / Composite">ACP / Composite</option>
                        <option value="Metal & Steel">Metal & Steel</option>
                        <option value="Electrical & LED">Electrical & LED</option>
                        <option value="Substrate Backing">Substrate Backing</option>
                        <option value="Vinyl & Films">Vinyl & Films</option>
                        <option value="Structural Hardware">Structural Hardware</option>
                      </select>
                    </div>

                    {/* 3. Application Scope */}
                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="mat-app">
                        Application Scope
                      </Label>
                      <select
                        id="mat-app"
                        className="printpal-form-input h-9 text-[13px] bg-white cursor-pointer"
                        value={materialForm.application}
                        onChange={(e) =>
                          setMaterialForm((prev) => ({
                            ...prev,
                            application: e.target.value as "Indoor" | "Outdoor" | "Coastal",
                          }))
                        }
                      >
                        <option value="Outdoor">Outdoor Rated (UV & Weatherproof)</option>
                        <option value="Indoor">Indoor (Architectural / Retail)</option>
                        <option value="Coastal">Coastal Grade (Marine Saline Resistant)</option>
                      </select>
                    </div>

                    {/* 4. Preferred Supplier */}
                    {isSupplierEnabled && (
                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                        <Label className="printpal-form-label" htmlFor="mat-supplier">
                          Preferred Supplier / Vendor
                        </Label>
                        <Input
                          id="mat-supplier"
                          placeholder="e.g. Mehta Plastics / Jindal Stainless"
                          className="printpal-form-input"
                          value={materialForm.supplierName}
                          onChange={(e) => setMaterialForm((prev) => ({ ...prev, supplierName: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>

                  {/* Right Column: Physical Dimensions & Fabrication Notes */}
                  <div className="printpal-right-column">
                    <div className="printpal-sites-list-container">
                      <div className="printpal-sites-stack">
                        {/* Card 1: Gauge & Standard Sizes */}
                        <div className="printpal-site-card">
                          <div className="printpal-site-card-header cursor-default">
                            <div className="printpal-site-card-title">
                              <span className="text-[13px] font-semibold text-[#202428]">
                                Thickness & Standard Dimensions
                              </span>
                            </div>
                          </div>

                          <div className="printpal-site-card-body">
                            <div className="printpal-site-info-fields" style={{ padding: "16px" }}>
                              <div className="printpal-form-row-2" style={{ marginBottom: 0 }}>
                                <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                  <Label className="printpal-form-label" htmlFor="mat-thickness">
                                    Thickness / Gauge
                                  </Label>
                                  <Input
                                    id="mat-thickness"
                                    placeholder="e.g. 3mm / 5mm or 4mm (0.5mm skin)"
                                    className="printpal-form-input"
                                    value={materialForm.thickness}
                                    onChange={(e) => setMaterialForm((prev) => ({ ...prev, thickness: e.target.value }))}
                                  />
                                </div>
                                <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                  <Label className="printpal-form-label" htmlFor="mat-size">
                                    Standard Sheet / Pack Size
                                  </Label>
                                  <Input
                                    id="mat-size"
                                    placeholder="e.g. 8 × 4 ft Sheet / 50 pcs String"
                                    className="printpal-form-input"
                                    value={materialForm.standardSize}
                                    onChange={(e) => setMaterialForm((prev) => ({ ...prev, standardSize: e.target.value }))}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card 2: Technical Specifications & Workshop Notes */}
                        <div className="printpal-site-card">
                          <div className="printpal-site-card-header cursor-default">
                            <div className="printpal-site-card-title">
                              <span className="text-[13px] font-semibold text-[#202428]">
                                Technical & Fabrication Guidance
                              </span>
                            </div>
                          </div>

                          <div className="printpal-site-card-body">
                            <div className="printpal-site-info-fields" style={{ padding: "16px" }}>
                              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                <Label className="printpal-form-label" htmlFor="mat-notes">
                                  Fabrication & Laser Cutting Notes
                                </Label>
                                <Textarea
                                  id="mat-notes"
                                  placeholder="Optical transmission %, laser cutting feed rate, CNC folding V-grooves, fire retardant ratings..."
                                  className="min-h-[80px] text-[13px] border-[#DCE1E5] bg-white text-[#202428] placeholder:text-[#737B84] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0]"
                                  value={materialForm.notes}
                                  onChange={(e) => setMaterialForm((prev) => ({ ...prev, notes: e.target.value }))}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : drawerTitle.includes("Finish") ? (
              /* Finish Form in 2-Column Desktop Spec */
              <div className="printpal-new-cust-grid-wrapper">
                {Object.keys(finishErrors).length > 0 && (
                  <div className="flex items-center gap-2 p-3 mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <span>Please resolve the errors marked below to save the finish.</span>
                  </div>
                )}

                <div className="printpal-new-cust-grid">
                  {/* Left Column Card: Basic Finish Details (300px Fixated) */}
                  <div className="printpal-card-basic-details">
                    <div className="printpal-card-title">Finish Details</div>

                    {/* 1. Finish Name */}
                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="fin-name">
                        Finish / Treatment Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fin-name"
                        placeholder="e.g. Architectural Polyester Powder Coating (Pure White)"
                        className={`printpal-form-input ${finishErrors.name ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                        value={finishForm.name}
                        onChange={(e) => {
                          setFinishForm((prev) => ({ ...prev, name: e.target.value }))
                          if (finishErrors.name) {
                            setFinishErrors((prev) => {
                              const n = { ...prev }
                              delete n.name
                              return n
                            })
                          }
                        }}
                      />
                      {finishErrors.name && (
                        <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {finishErrors.name}
                        </span>
                      )}
                    </div>

                    {/* 2. Process Type */}
                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="fin-type">
                        Process Type
                      </Label>
                      <select
                        id="fin-type"
                        className="printpal-form-input h-9 text-[13px] bg-white cursor-pointer"
                        value={finishForm.type}
                        onChange={(e) => setFinishForm((prev) => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="Powder Coating">Powder Coating (TGIC / Epoxy Polyester)</option>
                        <option value="PVD Plating">PVD Titanium Vacuum Plating</option>
                        <option value="Vinyl Overlay">Cast Vinyl Overlay (3M / Avery)</option>
                        <option value="Brushed / Polish">Brushed Hairline / Mirror Polish</option>
                        <option value="Anodizing">Anodizing (AA10 / AA15 / AA25)</option>
                        <option value="PU Paint">Two-Pack Polyurethane (PU) Paint</option>
                      </select>
                    </div>

                    {/* 3. Application Environment */}
                    <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                      <Label className="printpal-form-label" htmlFor="fin-app">
                        Application Environment
                      </Label>
                      <select
                        id="fin-app"
                        className="printpal-form-input h-9 text-[13px] bg-white cursor-pointer"
                        value={finishForm.application}
                        onChange={(e) =>
                          setFinishForm((prev) => ({
                            ...prev,
                            application: e.target.value as "Indoor" | "Outdoor" | "Coastal",
                          }))
                        }
                      >
                        <option value="Outdoor">Outdoor Rated (UV & Weather Resistant)</option>
                        <option value="Indoor">Indoor (Architectural & Luxury)</option>
                        <option value="Coastal">Coastal Grade (Marine Salt Spray Resistant)</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column: Color Reference & Technical Curing Specs */}
                  <div className="printpal-right-column">
                    <div className="printpal-sites-list-container">
                      <div className="printpal-sites-stack">
                        {/* Card 1: Color Standard & Optical Spec */}
                        <div className="printpal-site-card">
                          <div className="printpal-site-card-header cursor-default">
                            <div className="printpal-site-card-title">
                              <span className="text-[13px] font-semibold text-[#202428]">
                                Color Reference & Architectural Standards
                              </span>
                            </div>
                          </div>

                          <div className="printpal-site-card-body">
                            <div className="printpal-site-info-fields" style={{ padding: "16px" }}>
                              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                <Label className="printpal-form-label" htmlFor="fin-color">
                                  Color Code / RAL / Pantone / Grain Texture
                                </Label>
                                <Input
                                  id="fin-color"
                                  placeholder="e.g. RAL 9016 (Gloss 85%) or 3M 3630-33 / Pantone 485C"
                                  className="printpal-form-input"
                                  value={finishForm.colorCode}
                                  onChange={(e) => setFinishForm((prev) => ({ ...prev, colorCode: e.target.value }))}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card 2: Curing & Application Specs */}
                        <div className="printpal-site-card">
                          <div className="printpal-site-card-header cursor-default">
                            <div className="printpal-site-card-title">
                              <span className="text-[13px] font-semibold text-[#202428]">
                                Process & Curing Guidelines
                              </span>
                            </div>
                          </div>

                          <div className="printpal-site-card-body">
                            <div className="printpal-site-info-fields" style={{ padding: "16px" }}>
                              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                <Label className="printpal-form-label" htmlFor="fin-notes">
                                  Curing Temperature, Film Thickness & Warranty
                                </Label>
                                <Textarea
                                  id="fin-notes"
                                  placeholder="Oven curing temp (e.g. 200°C for 10 mins), 60-80 micron dry film thickness (DFT), anti-fingerprint coating..."
                                  className="min-h-[80px] text-[13px] border-[#DCE1E5] bg-white text-[#202428] placeholder:text-[#737B84] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0]"
                                  value={finishForm.notes}
                                  onChange={(e) => setFinishForm((prev) => ({ ...prev, notes: e.target.value }))}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Customer / Enquiry Form */
              <div className="printpal-new-cust-grid-wrapper">
                <div className="printpal-new-cust-grid">
                  {/* ── Left Column Card: Basic Details (20px padding) ── */}
                  <div
                    id="drawer-basic-details-card"
                    className={`printpal-card-basic-details printpal-anchor-target ${highlightedAnchorKey === "drawer-basic-details-card"
                      ? "printpal-anchor-highlight"
                      : ""
                      }`}
                  >
                    <div className="printpal-card-title">Basic Details</div>

                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="input-biz-name">
                        Business Name
                      </Label>
                      <Input
                        type="text"
                        id="input-biz-name"
                        className={`printpal-form-input ${formErrors.businessName ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                        value={formBasicDetails.businessName}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormBasicDetails((prev) => ({ ...prev, businessName: val }))
                          if (formErrors.businessName || formErrors.primaryContactName) {
                            setFormErrors((prev) => {
                              const next = { ...prev }
                              delete next.businessName
                              if (val.trim()) {
                                delete next.primaryContactName
                              }
                              return next
                            })
                          }
                        }}
                        placeholder=""
                      />
                      {formErrors.businessName && (
                        <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {formErrors.businessName}
                        </span>
                      )}
                    </div>

                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="input-contact-name">
                        Primary Contact Name
                      </Label>
                      <Input
                        type="text"
                        id="input-contact-name"
                        className={`printpal-form-input ${formErrors.primaryContactName ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                        value={formBasicDetails.primaryContactName}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormBasicDetails((prev) => ({ ...prev, primaryContactName: val }))
                          if (formErrors.primaryContactName || formErrors.businessName) {
                            setFormErrors((prev) => {
                              const next = { ...prev }
                              delete next.primaryContactName
                              if (val.trim()) {
                                delete next.businessName
                              }
                              return next
                            })
                          }
                        }}
                        placeholder=""
                      />
                      {formErrors.primaryContactName && (
                        <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {formErrors.primaryContactName}
                        </span>
                      )}
                    </div>

                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="input-contact-phone">
                        Primary Contact Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="tel"
                        id="input-contact-phone"
                        className={`printpal-form-input ${formErrors.primaryContactNumber ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                        value={formBasicDetails.primaryContactNumber}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormBasicDetails((prev) => ({
                            ...prev,
                            primaryContactNumber: val,
                            whatsappNumber: prev.isWhatsAppSame ? val : prev.whatsappNumber,
                          }))
                          if (formErrors.primaryContactNumber) {
                            setFormErrors((prev) => {
                              const next = { ...prev }
                              delete next.primaryContactNumber
                              return next
                            })
                          }
                        }}
                        placeholder=""
                      />
                      {formErrors.primaryContactNumber && (
                        <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {formErrors.primaryContactNumber}
                        </span>
                      )}
                      <div className="printpal-checkbox-label">
                        <Checkbox
                          id="input-whatsapp-same"
                          checked={formBasicDetails.isWhatsAppSame}
                          onCheckedChange={(checked) =>
                            setFormBasicDetails((prev) => ({
                              ...prev,
                              isWhatsAppSame: checked === true,
                              whatsappNumber:
                                checked === true
                                  ? prev.primaryContactNumber
                                  : prev.whatsappNumber,
                            }))
                          }
                        />
                        <Label
                          htmlFor="input-whatsapp-same"
                          className="cursor-pointer font-normal text-xs text-[#202428] leading-tight select-none"
                        >
                          WhatsApp number is same as primary contact number
                        </Label>
                      </div>
                    </div>

                    {/* Conditional Primary WhatsApp Number field when unchecked */}
                    {!formBasicDetails.isWhatsAppSame && (
                      <div className="printpal-form-group printpal-whatsapp-field-enter">
                        <Label className="printpal-form-label" htmlFor="input-whatsapp-number">
                          Primary WhatsApp Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="tel"
                          id="input-whatsapp-number"
                          className={`printpal-form-input ${formErrors.whatsappNumber ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                          value={formBasicDetails.whatsappNumber}
                          onChange={(e) => {
                            const val = e.target.value
                            setFormBasicDetails((prev) => ({
                              ...prev,
                              whatsappNumber: val,
                            }))
                            if (formErrors.whatsappNumber) {
                              setFormErrors((prev) => {
                                const next = { ...prev }
                                delete next.whatsappNumber
                                return next
                              })
                            }
                          }}
                          placeholder="e.g. 9876543210"
                          autoFocus
                        />
                        {formErrors.whatsappNumber && (
                          <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {formErrors.whatsappNumber}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="input-email">
                        Email
                      </Label>
                      <Input
                        type="email"
                        id="input-email"
                        className={`printpal-form-input ${formErrors.email ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                        value={formBasicDetails.email}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormBasicDetails((prev) => ({ ...prev, email: val }))
                          if (formErrors.email) {
                            setFormErrors((prev) => {
                              const next = { ...prev }
                              delete next.email
                              return next
                            })
                          }
                        }}
                        placeholder=""
                      />
                      {formErrors.email && (
                        <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {formErrors.email}
                        </span>
                      )}
                    </div>

                    <div className="printpal-form-group">
                      <Label className="printpal-form-label" htmlFor="input-followup-date">
                        Follow-up date
                      </Label>
                      <DatePicker
                        id="input-followup-date"
                        date={formBasicDetails.followUpDate}
                        onDateChange={(_date, dateStr) =>
                          setFormBasicDetails((prev) => ({ ...prev, followUpDate: dateStr }))
                        }
                        placeholder="dd-mm-yyyy"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-9 border-[#D7440E] text-[#D7440E] hover:bg-[#D7440E]/10 hover:text-[#D7440E] hover:border-[#D7440E] font-medium text-[13px] rounded-md transition-colors shadow-none cursor-pointer focus-visible:ring-1 focus-visible:ring-[#D7440E]"
                        onClick={handleSaveAsEnquiry}
                      >
                        Save as enquiry
                      </Button>
                    </div>
                  </div>

                  {/* ── Right Column: Standalone Tabs Card + Sites / Billing (Desktop - 4) ── */}
                  <div className="printpal-right-column">
                    {/* Scrollable Container for Tabs + Site Cards / Billing */}
                    <div className="printpal-sites-scroll-area">
                      {/* Standalone Tabs Card Component (Matches site card width, scrolls alongside) */}
                      <div className="printpal-tabs-card">
                        <div className="printpal-site-tabs-nav">
                          <button
                            type="button"
                            className={`printpal-site-tab-btn ${activeRightTab === "services" ? "active" : ""}`}
                            onClick={() => setActiveRightTab("services")}
                          >
                            Services & Site Details
                          </button>
                          <button
                            type="button"
                            className={`printpal-site-tab-btn ${activeRightTab === "billing" ? "active" : ""}`}
                            onClick={() => setActiveRightTab("billing")}
                          >
                            Billing Address
                          </button>
                        </div>
                      </div>

                      {activeRightTab === "services" ? (
                        <>
                          {/* Standalone Sites Cards Wrapper */}
                          <div className="printpal-sites-wrapper">
                            {formSites.map((site, siteIdx) => {
                              const siteNum = siteIdx + 1
                              const isCollapsed = collapsedSites.has(site.id)
                              const siteDisplayName = site.siteName?.trim()
                              const serviceCount = site.serviceDetails?.length || 1

                              return (
                                <div
                                  key={site.id}
                                  id={`drawer-site-${siteIdx}`}
                                  className={`printpal-site-card printpal-anchor-target ${highlightedAnchorKey === `drawer-site-${siteIdx}`
                                    ? "printpal-anchor-highlight"
                                    : ""
                                    }`}
                                >
                                  {/* Site Header Pill Bar (#F3F5F7, height 36px) */}
                                  <div
                                    className="printpal-site-card-header"
                                    onClick={() => handleToggleCollapse(site.id)}
                                  >
                                    <div className="printpal-site-card-title">
                                      <span
                                        className={
                                          siteDisplayName
                                            ? "text-[13px] font-semibold text-[#202428]"
                                            : "text-[13px] font-normal text-[#737B84]"
                                        }
                                      >
                                        {siteDisplayName || "Site name"}
                                      </span>
                                      <BadgeGroup
                                        variant="green"
                                        label={`Site ${siteNum}`}
                                        counter={`${serviceCount} ${serviceCount === 1 ? "service" : "services"}`}
                                      />
                                    </div>
                                    <div className="printpal-site-card-tools">
                                      <button
                                        type="button"
                                        className="printpal-icon-btn delete"
                                        title="Delete Site"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteSite(siteIdx)
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        className="printpal-icon-btn printpal-btn-collapse"
                                        title="Collapse / Expand"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleToggleCollapse(site.id)
                                        }}
                                      >
                                        <ChevronDown
                                          className="h-3.5 w-3.5"
                                          style={{
                                            transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                                            transition: "transform 0.2s ease",
                                          }}
                                        />
                                      </button>
                                    </div>
                                  </div>

                                  {!isCollapsed && (
                                    <div className="printpal-site-card-body">
                                      <div className="printpal-site-info-fields">
                                        {/* Site Name Input (Moved above search field) */}
                                        <div className="printpal-form-group">
                                          <Label className="printpal-form-label" htmlFor={`drawer-site-${siteIdx}-name`}>Site Name</Label>
                                          <Input
                                            id={`drawer-site-${siteIdx}-name`}
                                            type="text"
                                            className="printpal-form-input"
                                            value={site.siteName || ""}
                                            onChange={(e) => {
                                              const updated = [...formSites]
                                              updated[siteIdx] = {
                                                ...updated[siteIdx],
                                                siteName: e.target.value,
                                              }
                                              setFormSites(updated)
                                            }}
                                          />
                                        </div>

                                        {/* Google Maps Search Bar + 36px Rounded Live View Button */}
                                        <div className="printpal-search-row">
                                          <div className={`printpal-site-search-wrapper relative ${formErrors[`site_${siteIdx}_address`] ? "border border-red-500 rounded-md" : ""}`}>
                                            <Search className="printpal-search-icon" />
                                            <Input
                                              type="text"
                                              className="printpal-site-search-input pr-8"
                                              placeholder="Search the site location (business name or address)"
                                              value={site.address || ""}
                                              autoComplete="off"
                                              onFocus={() => setActiveSearchSiteId(site.id)}
                                              onChange={(e) => {
                                                const val = e.target.value
                                                setFormSites((prev) => {
                                                  const updated = [...prev]
                                                  if (updated[siteIdx]) {
                                                    updated[siteIdx] = {
                                                      ...updated[siteIdx],
                                                      address: val,
                                                    }
                                                  }
                                                  return updated
                                                })
                                                setActiveSearchSiteId(site.id)
                                                if (formErrors[`site_${siteIdx}_address`]) {
                                                  setFormErrors((prev) => {
                                                    const next = { ...prev }
                                                    delete next[`site_${siteIdx}_address`]
                                                    return next
                                                  })
                                                }
                                              }}
                                            />
                                            {site.address && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setFormSites((prev) => {
                                                    const updated = [...prev]
                                                    if (updated[siteIdx]) {
                                                      updated[siteIdx] = {
                                                        ...updated[siteIdx],
                                                        address: "",
                                                      }
                                                    }
                                                    return updated
                                                  })
                                                  setGeoapifyPredictions([])
                                                }}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737B84] hover:text-[#202428] cursor-pointer p-1"
                                                title="Clear location search"
                                              >
                                                <X className="h-3.5 w-3.5" />
                                              </button>
                                            )}

                                            {/* Geoapify Places Autocomplete Dropdown */}
                                            {activeSearchSiteId === site.id && (
                                              <div className="printpal-maps-autocomplete-dropdown">
                                                <div className="printpal-maps-dropdown-header">
                                                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#737B84] uppercase tracking-wider">
                                                    <MapPin className="h-3 w-3 text-[#2878D0]" />
                                                    Geoapify Places
                                                  </span>
                                                  {GEOAPIFY_API_KEY && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                      Live API
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="printpal-maps-dropdown-list">
                                                  {!GEOAPIFY_API_KEY ? (
                                                    <div className="p-3.5 text-center text-xs text-[#737B84]">
                                                      <div className="flex items-center justify-center gap-1.5 font-medium text-[#202428] mb-1">
                                                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                                                        <span>Geoapify API Key Required</span>
                                                      </div>
                                                      <div className="text-[11px] leading-relaxed text-[#737B84]">
                                                        Add <code className="bg-gray-100 text-[#2878D0] px-1 py-0.5 rounded font-mono text-[10px]">VITE_GEOAPIFY_API_KEY</code> to <code className="bg-gray-100 text-[#202428] px-1 py-0.5 rounded font-mono text-[10px]">product/PrintPal/.env</code> to query live places.
                                                      </div>
                                                    </div>
                                                  ) : isSearchingPlaces ? (
                                                    <div className="p-4 text-center text-xs text-[#737B84] flex items-center justify-center gap-2">
                                                      <Loader2 className="h-4 w-4 animate-spin text-[#2878D0]" />
                                                      <span>Searching places...</span>
                                                    </div>
                                                  ) : geoapifyPredictions.length > 0 ? (
                                                    geoapifyPredictions.map((place) => (
                                                      <div
                                                        key={place.id}
                                                        className="printpal-maps-dropdown-item"
                                                        onMouseDown={(e) => {
                                                          e.preventDefault()
                                                          handleSelectPlace(siteIdx, place)
                                                        }}
                                                      >
                                                        <div className="printpal-maps-item-icon">
                                                          <MapPin className="h-3.5 w-3.5 text-red-500" />
                                                        </div>
                                                        <div className="printpal-maps-item-info">
                                                          <div className="printpal-maps-item-name">{place.name}</div>
                                                          <div className="printpal-maps-item-address">{place.formattedAddress}</div>
                                                        </div>
                                                      </div>
                                                    ))
                                                  ) : (site.address || "").trim().length >= 2 ? (
                                                    <div className="p-3 text-center text-xs text-[#737B84]">
                                                      No results found for "{site.address}".
                                                    </div>
                                                  ) : (
                                                    <div className="p-3 text-center text-xs text-[#737B84]">
                                                      Type 2 or more characters to search locations...
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          {/* 36px 'Live View' Button Component (Outline Secondary variant) — Only appears when location with lat/lng is selected */}
                                          {Boolean(site.lat && site.lng) && (
                                            <Button
                                              type="button"
                                              variant="outlineSecondary"
                                              size="default"
                                              className="printpal-btn-live-view px-4 text-[13px] font-medium rounded-md shadow-sm cursor-pointer"
                                              onClick={() => handleOpenLiveView(site)}
                                              title="Open Google Maps 360° Street View in a new tab"
                                            >
                                              <Compass className="h-3.5 w-3.5 text-secondary" />
                                              <span>Live View</span>
                                            </Button>
                                          )}
                                        </div>

                                        {formErrors[`site_${siteIdx}_address`] && (
                                          <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1 mb-2">
                                            <AlertCircle className="h-3 w-3 shrink-0" />
                                            {formErrors[`site_${siteIdx}_address`]}
                                          </span>
                                        )}

                                        <div
                                          className="printpal-manual-address-link"
                                          onClick={() => {
                                            const el = document.getElementById(`site-addr1-${site.id}`)
                                            el?.focus()
                                          }}
                                        >
                                          Cant find it ? Enter address manually
                                        </div>

                                        {/* Address Line 1 & 2 (2 Columns) */}
                                        <div className="printpal-form-row-2">
                                          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                            <Label className="printpal-form-label">Address Line 1</Label>
                                            <Input
                                              type="text"
                                              id={`site-addr1-${site.id}`}
                                              className="printpal-form-input"
                                              value={site.addressLine1 || ""}
                                              onChange={(e) => {
                                                const updated = [...formSites]
                                                updated[siteIdx] = {
                                                  ...updated[siteIdx],
                                                  addressLine1: e.target.value,
                                                }
                                                setFormSites(updated)
                                              }}
                                            />
                                          </div>
                                          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                            <Label className="printpal-form-label">Address Line 2</Label>
                                            <Input
                                              type="text"
                                              className="printpal-form-input"
                                              value={site.addressLine2 || ""}
                                              onChange={(e) => {
                                                const updated = [...formSites]
                                                updated[siteIdx] = {
                                                  ...updated[siteIdx],
                                                  addressLine2: e.target.value,
                                                }
                                                setFormSites(updated)
                                              }}
                                            />
                                          </div>
                                        </div>

                                        {/* City, State, Pincode (3 Columns) */}
                                        <div className="printpal-form-row-3">
                                          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                            <Label className="printpal-form-label">City</Label>
                                            <Input
                                              type="text"
                                              className="printpal-form-input"
                                              value={site.city || ""}
                                              onChange={(e) => {
                                                const updated = [...formSites]
                                                updated[siteIdx] = {
                                                  ...updated[siteIdx],
                                                  city: e.target.value,
                                                }
                                                setFormSites(updated)
                                              }}
                                            />
                                          </div>
                                          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                            <Label className="printpal-form-label">State</Label>
                                            <Input
                                              type="text"
                                              className="printpal-form-input"
                                              value={site.state || ""}
                                              onChange={(e) => {
                                                const updated = [...formSites]
                                                updated[siteIdx] = {
                                                  ...updated[siteIdx],
                                                  state: e.target.value,
                                                }
                                                setFormSites(updated)
                                              }}
                                            />
                                          </div>
                                          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                            <Label className="printpal-form-label">Pincode</Label>
                                            <Input
                                              type="text"
                                              className={`printpal-form-input ${formErrors[`site_${siteIdx}_pincode`] ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                                              value={site.pincode || ""}
                                              placeholder="e.g. 560001"
                                              onChange={(e) => {
                                                const updated = [...formSites]
                                                updated[siteIdx] = {
                                                  ...updated[siteIdx],
                                                  pincode: e.target.value,
                                                }
                                                setFormSites(updated)
                                                if (formErrors[`site_${siteIdx}_pincode`]) {
                                                  setFormErrors((prev) => {
                                                    const next = { ...prev }
                                                    delete next[`site_${siteIdx}_pincode`]
                                                    return next
                                                  })
                                                }
                                              }}
                                            />
                                            {formErrors[`site_${siteIdx}_pincode`] && (
                                              <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                                                <AlertCircle className="h-3 w-3 shrink-0" />
                                                {formErrors[`site_${siteIdx}_pincode`]}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Target Delivery Date & Site Contact Coordination (3-column layout) */}
                                        <div className="printpal-form-row-3">
                                          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                            <Label className="printpal-form-label" htmlFor={`site-${siteIdx}-delivery-date`}>Target Delivery Date</Label>
                                            <DatePicker
                                              date={site.targetDeliveryDate}
                                              onDateChange={(_d, dateStr) => {
                                                const updated = [...formSites]
                                                updated[siteIdx] = {
                                                  ...updated[siteIdx],
                                                  targetDeliveryDate: dateStr,
                                                }
                                                setFormSites(updated)
                                              }}
                                              placeholder="dd-mm-yyyy"
                                            />
                                          </div>

                                          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                            <Label className="printpal-form-label" htmlFor={`site-${siteIdx}-contact-name`}>Site Contact Name</Label>
                                            <Input
                                              id={`site-${siteIdx}-contact-name`}
                                              type="text"
                                              className="printpal-form-input"
                                              value={site.contactPerson || ""}
                                              placeholder="e.g. Ramesh (Store In-Charge)"
                                              onChange={(e) => {
                                                const updated = [...formSites]
                                                updated[siteIdx] = {
                                                  ...updated[siteIdx],
                                                  contactPerson: e.target.value,
                                                }
                                                setFormSites(updated)
                                              }}
                                            />
                                          </div>

                                          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                            <Label className="printpal-form-label" htmlFor={`site-${siteIdx}-contact-phone`}>Site Contact Phone</Label>
                                            <Input
                                              id={`site-${siteIdx}-contact-phone`}
                                              type="tel"
                                              className={`printpal-form-input ${formErrors[`site_${siteIdx}_contact_phone`] ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                                              value={site.contactPhone || ""}
                                              placeholder="e.g. 98400 12345"
                                              onChange={(e) => {
                                                const updated = [...formSites]
                                                updated[siteIdx] = {
                                                  ...updated[siteIdx],
                                                  contactPhone: e.target.value,
                                                }
                                                setFormSites(updated)
                                                if (formErrors[`site_${siteIdx}_contact_phone`]) {
                                                  setFormErrors((prev) => {
                                                    const next = { ...prev }
                                                    delete next[`site_${siteIdx}_contact_phone`]
                                                    return next
                                                  })
                                                }
                                              }}
                                            />
                                            {formErrors[`site_${siteIdx}_contact_phone`] && (
                                              <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                                                <AlertCircle className="h-3 w-3 shrink-0" />
                                                {formErrors[`site_${siteIdx}_contact_phone`]}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="printpal-form-divider" />
                                      </div>

                                      {/* Services on this site section */}
                                      <div className="printpal-services-section">
                                        <div className="printpal-services-section-title">
                                          Services on this site
                                        </div>
                                        <div className="printpal-services-list-wrapper">
                                          {(site.serviceDetails || []).map((srv, srvIdx) => {
                                            const matchedProduct = products.find(
                                              (p) => p.title.toLowerCase() === (srv.signStyle || "").toLowerCase()
                                            )
                                            const availableMaterials = matchedProduct?.materialIds && matchedProduct.materialIds.length > 0
                                              ? [
                                                ...materials.filter((m) => matchedProduct.materialIds?.includes(m.id)),
                                                ...materials.filter((m) => !matchedProduct.materialIds?.includes(m.id)),
                                              ]
                                              : materials

                                            const availableFinishes = matchedProduct?.finishIds && matchedProduct.finishIds.length > 0
                                              ? [
                                                ...finishes.filter((f) => matchedProduct.finishIds?.includes(f.id)),
                                                ...finishes.filter((f) => !matchedProduct.finishIds?.includes(f.id)),
                                              ]
                                              : finishes

                                            return (
                                              <div
                                                key={srv.id}
                                                id={`drawer-site-${siteIdx}-service-${srvIdx}`}
                                                className={`printpal-service-block-card printpal-anchor-target ${highlightedAnchorKey ===
                                                  `drawer-site-${siteIdx}-service-${srvIdx}`
                                                  ? "printpal-anchor-highlight"
                                                  : ""
                                                  }`}
                                              >
                                                {/* Card Header: [#1] Service 1 + Trash button */}
                                                <div className="printpal-service-block-header">
                                                  <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-semibold text-[#202428] bg-white border border-[#DCE1E5] rounded">
                                                      #{srvIdx + 1}
                                                    </span>
                                                    <span className="printpal-service-block-title">
                                                      Service {srvIdx + 1}
                                                    </span>
                                                  </div>
                                                  {(site.serviceDetails?.length || 0) > 1 && (
                                                    <button
                                                      type="button"
                                                      className="printpal-service-del-btn p-1 rounded hover:bg-red-50 text-[#737B84] hover:text-red-500 transition-colors"
                                                      title="Remove Service"
                                                      onClick={() => handleDeleteService(siteIdx, srvIdx)}
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </button>
                                                  )}
                                                </div>

                                                {/* Row 1: Sign Style (Left) + Environment / Placement (Right) */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                                  <div>
                                                    <Label className="text-xs font-medium text-[#737B84] block mb-1.5">
                                                      Sign style <span className="text-red-500">*</span>
                                                    </Label>
                                                    <SearchableActionSelect
                                                      value={srv.signStyle}
                                                      options={products
                                                        .filter((p) => p.isActive !== false)
                                                        .map((p) => ({ value: p.title, label: p.title }))}
                                                      placeholder="Select Sign Style..."
                                                      searchPlaceholder="Search products..."
                                                      emptyMessage="No products cataloged yet"
                                                      addActionText="Add new Product"
                                                      error={Boolean(formErrors[`site_${siteIdx}_srv_${srvIdx}_signStyle`])}
                                                      onAddAction={() => {
                                                        setProductDrawerReturnTitle(drawerTitle)
                                                        setQuickTargetService({ siteIdx, srvIdx })
                                                        openDrawerForProduct()
                                                      }}
                                                      onChange={(val) => {
                                                        const updated = [...formSites]
                                                        const srvs = [...(site.serviceDetails || [])]
                                                        const newMatched = products.find((p) => p.title === val)
                                                        let nextMat = srv.material
                                                        let nextFin = srv.finishing

                                                        const validMats = newMatched?.materialIds
                                                          ? materials.filter((m) => newMatched.materialIds!.includes(m.id))
                                                          : []
                                                        if (!validMats.some((m) => m.name === nextMat)) {
                                                          nextMat = validMats[0]?.name || ""
                                                        }

                                                        const validFins = newMatched?.finishIds
                                                          ? finishes.filter((f) => newMatched.finishIds!.includes(f.id))
                                                          : []
                                                        if (!validFins.some((f) => f.name === nextFin)) {
                                                          nextFin = validFins[0]?.name || ""
                                                        }

                                                        srvs[srvIdx] = {
                                                          ...srv,
                                                          signStyle: val,
                                                          material: nextMat,
                                                          finishing: nextFin,
                                                        }
                                                        updated[siteIdx] = {
                                                          ...site,
                                                          serviceDetails: srvs,
                                                        }
                                                        setFormSites(updated)
                                                        if (formErrors[`site_${siteIdx}_srv_${srvIdx}_signStyle`]) {
                                                          setFormErrors((prev) => {
                                                            const next = { ...prev }
                                                            delete next[`site_${siteIdx}_srv_${srvIdx}_signStyle`]
                                                            return next
                                                          })
                                                        }
                                                      }}
                                                    />
                                                    {formErrors[`site_${siteIdx}_srv_${srvIdx}_signStyle`] && (
                                                      <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                                                        <AlertCircle className="h-3 w-3 shrink-0" />
                                                        {formErrors[`site_${siteIdx}_srv_${srvIdx}_signStyle`]}
                                                      </span>
                                                    )}
                                                  </div>

                                                  <div>
                                                    <Label className="text-xs font-medium text-[#737B84] block mb-1.5">
                                                      Environment / Placement
                                                    </Label>
                                                    <div className="flex items-center gap-2">
                                                      {(["Outdoor", "Indoor", "Coastal"] as const).map(
                                                        (app) => (
                                                          <button
                                                            key={app}
                                                            type="button"
                                                            className={`printpal-pill-btn flex-1 h-9 ${srv.application === app ? "active" : ""}`}
                                                            onClick={() => {
                                                              const updated = [...formSites]
                                                              const srvs = [...(site.serviceDetails || [])]
                                                              srvs[srvIdx] = { ...srv, application: app }
                                                              updated[siteIdx] = {
                                                                ...site,
                                                                serviceDetails: srvs,
                                                              }
                                                              setFormSites(updated)
                                                            }}
                                                          >
                                                            {app}
                                                          </button>
                                                        )
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Row 2: Dimensions & Quantity + Not sure of dimensions yet Checkbox */}
                                                <div className="mb-4">
                                                  <Label className="text-xs font-medium text-[#737B84] block mb-1.5">
                                                    Dimensions & Quantity
                                                  </Label>
                                                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                                                    <div className="flex-1 min-w-[90px]">
                                                      <Input
                                                        type="number"
                                                        placeholder="W"
                                                        disabled={srv.notSureOfDimensions}
                                                        value={srv.width || ""}
                                                        onChange={(e) => {
                                                          const updated = [...formSites]
                                                          const srvs = [...(site.serviceDetails || [])]
                                                          srvs[srvIdx] = { ...srv, width: e.target.value }
                                                          updated[siteIdx] = {
                                                            ...site,
                                                            serviceDetails: srvs,
                                                          }
                                                          setFormSites(updated)
                                                          if (formErrors[`site_${siteIdx}_srv_${srvIdx}_width`]) {
                                                            setFormErrors((prev) => {
                                                              const next = { ...prev }
                                                              delete next[`site_${siteIdx}_srv_${srvIdx}_width`]
                                                              return next
                                                            })
                                                          }
                                                        }}
                                                        className={`h-9 text-center placeholder:text-center text-[13px] border-[#DCE1E5] bg-white text-[#202428] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none no-spin-arrows ${formErrors[`site_${siteIdx}_srv_${srvIdx}_width`] ? "border-red-500" : ""} ${srv.notSureOfDimensions ? "opacity-50 cursor-not-allowed bg-[#F8FAFC]" : ""}`}
                                                      />
                                                    </div>

                                                    <span className="text-xs font-semibold text-[#737B84] select-none">✕</span>

                                                    <div className="flex-1 min-w-[90px]">
                                                      <Input
                                                        type="number"
                                                        placeholder="H"
                                                        disabled={srv.notSureOfDimensions}
                                                        value={srv.height || ""}
                                                        onChange={(e) => {
                                                          const updated = [...formSites]
                                                          const srvs = [...(site.serviceDetails || [])]
                                                          srvs[srvIdx] = { ...srv, height: e.target.value }
                                                          updated[siteIdx] = {
                                                            ...site,
                                                            serviceDetails: srvs,
                                                          }
                                                          setFormSites(updated)
                                                          if (formErrors[`site_${siteIdx}_srv_${srvIdx}_height`]) {
                                                            setFormErrors((prev) => {
                                                              const next = { ...prev }
                                                              delete next[`site_${siteIdx}_srv_${srvIdx}_height`]
                                                              return next
                                                            })
                                                          }
                                                        }}
                                                        className={`h-9 text-center placeholder:text-center text-[13px] border-[#DCE1E5] bg-white text-[#202428] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none no-spin-arrows ${formErrors[`site_${siteIdx}_srv_${srvIdx}_height`] ? "border-red-500" : ""} ${srv.notSureOfDimensions ? "opacity-50 cursor-not-allowed bg-[#F8FAFC]" : ""}`}
                                                      />
                                                    </div>

                                                    <div className="w-[80px]">
                                                      <Select
                                                        value={srv.unit || "ft"}
                                                        disabled={srv.notSureOfDimensions}
                                                        onValueChange={(val) => {
                                                          const updated = [...formSites]
                                                          const srvs = [...(site.serviceDetails || [])]
                                                          srvs[srvIdx] = { ...srv, unit: val }
                                                          updated[siteIdx] = {
                                                            ...site,
                                                            serviceDetails: srvs,
                                                          }
                                                          setFormSites(updated)
                                                        }}
                                                      >
                                                        <SelectTrigger className="w-full h-9 bg-white border-[#DCE1E5] text-[13px] text-[#202428] hover:border-[#b5bfc7] focus:border-[#2878D0] focus:ring-0 focus-visible:ring-1 focus-visible:ring-[#2878D0] data-[state=open]:border-[#2878D0]">
                                                          <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="min-w-[80px] bg-white border-[#DCE1E5] shadow-lg rounded-md z-[9999]">
                                                          <SelectItem value="ft">ft</SelectItem>
                                                          <SelectItem value="in">in</SelectItem>
                                                          <SelectItem value="mm">mm</SelectItem>
                                                          <SelectItem value="m">m</SelectItem>
                                                        </SelectContent>
                                                      </Select>
                                                    </div>

                                                    <div className={`flex items-center h-9 bg-white border rounded-md overflow-hidden transition-colors w-[100px] ${formErrors[`site_${siteIdx}_srv_${srvIdx}_quantity`] ? "border-red-500" : "border-[#DCE1E5] hover:border-[#b5bfc7] focus-within:border-[#2878D0]"}`}>
                                                      <input
                                                        type="number"
                                                        min={1}
                                                        value={srv.quantity || 1}
                                                        placeholder="1"
                                                        onChange={(e) => {
                                                          const updated = [...formSites]
                                                          const srvs = [...(site.serviceDetails || [])]
                                                          srvs[srvIdx] = {
                                                            ...srv,
                                                            quantity: Math.max(1, Number(e.target.value)),
                                                          }
                                                          updated[siteIdx] = {
                                                            ...site,
                                                            serviceDetails: srvs,
                                                          }
                                                          setFormSites(updated)
                                                          if (formErrors[`site_${siteIdx}_srv_${srvIdx}_quantity`]) {
                                                            setFormErrors((prev) => {
                                                              const next = { ...prev }
                                                              delete next[`site_${siteIdx}_srv_${srvIdx}_quantity`]
                                                              return next
                                                            })
                                                          }
                                                        }}
                                                        className="w-full h-full border-none bg-transparent text-center placeholder:text-center text-[13px] text-[#202428] font-medium outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none no-spin-arrows"
                                                      />
                                                    </div>
                                                  </div>

                                                  {/* Not sure of dimensions yet Checkbox */}
                                                  <div className="flex items-center gap-2 mt-2">
                                                    <Checkbox
                                                      id={`not-sure-dim-${siteIdx}-${srvIdx}`}
                                                      checked={Boolean(srv.notSureOfDimensions)}
                                                      onCheckedChange={(checked) => {
                                                        const updated = [...formSites]
                                                        const srvs = [...(site.serviceDetails || [])]
                                                        srvs[srvIdx] = {
                                                          ...srv,
                                                          notSureOfDimensions: Boolean(checked),
                                                        }
                                                        updated[siteIdx] = { ...site, serviceDetails: srvs }
                                                        setFormSites(updated)
                                                      }}
                                                    />
                                                    <label
                                                      htmlFor={`not-sure-dim-${siteIdx}-${srvIdx}`}
                                                      className="text-xs text-[#737B84] cursor-pointer select-none"
                                                    >
                                                      Not sure of dimensions yet
                                                    </label>
                                                  </div>

                                                  {(formErrors[`site_${siteIdx}_srv_${srvIdx}_width`] || formErrors[`site_${siteIdx}_srv_${srvIdx}_height`] || formErrors[`site_${siteIdx}_srv_${srvIdx}_quantity`]) && (
                                                    <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1.5">
                                                      <AlertCircle className="h-3 w-3 shrink-0" />
                                                      {formErrors[`site_${siteIdx}_srv_${srvIdx}_width`] || formErrors[`site_${siteIdx}_srv_${srvIdx}_height`] || formErrors[`site_${siteIdx}_srv_${srvIdx}_quantity`]}
                                                    </span>
                                                  )}
                                                </div>

                                                {/* Row 3: Material / Substrate (Left) + Finishing / Mounting (Right) */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                                  <div>
                                                    <Label className="text-xs font-medium text-[#737B84] block mb-1.5">
                                                      Material / Substrate
                                                    </Label>
                                                    <SearchableActionSelect
                                                      value={srv.material || ""}
                                                      disabled={false}
                                                      options={availableMaterials.map((mat) => ({ value: mat.name, label: mat.name }))}
                                                      placeholder="Select Material / Substrate..."
                                                      searchPlaceholder="Search materials..."
                                                      emptyMessage="No materials created in Settings yet"
                                                      addActionText="Add new Material"
                                                      onAddAction={() => {
                                                        openMaterialPrompt(null, { siteIdx, srvIdx })
                                                      }}
                                                      onChange={(val) => {
                                                        const updated = [...formSites]
                                                        const srvs = [...(site.serviceDetails || [])]
                                                        srvs[srvIdx] = { ...srv, material: val }
                                                        updated[siteIdx] = {
                                                          ...site,
                                                          serviceDetails: srvs,
                                                        }
                                                        setFormSites(updated)
                                                      }}
                                                    />
                                                  </div>

                                                  <div>
                                                    <Label className="text-xs font-medium text-[#737B84] block mb-1.5">
                                                      Finishing / Mounting
                                                    </Label>
                                                    <SearchableActionSelect
                                                      value={srv.finishing || ""}
                                                      disabled={false}
                                                      options={availableFinishes.map((fin) => ({ value: fin.name, label: fin.name }))}
                                                      placeholder="Select Finishing / Mounting..."
                                                      searchPlaceholder="Search finishes..."
                                                      emptyMessage="No finishes created in Settings yet"
                                                      addActionText="Add new Finish"
                                                      onAddAction={() => {
                                                        openFinishPrompt(null, { siteIdx, srvIdx })
                                                      }}
                                                      onChange={(val) => {
                                                        const updated = [...formSites]
                                                        const srvs = [...(site.serviceDetails || [])]
                                                        srvs[srvIdx] = { ...srv, finishing: val }
                                                        updated[siteIdx] = {
                                                          ...site,
                                                          serviceDetails: srvs,
                                                        }
                                                        setFormSites(updated)
                                                      }}
                                                    />
                                                  </div>
                                                </div>

                                                {/* Row 4: Artwork Status (Front/Left) + Colour / Shade Code (Next/Right) with Approach 2 Logic */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                                  <div>
                                                    <Label className="text-xs font-medium text-[#737B84] block mb-1.5">
                                                      Artwork Status
                                                    </Label>
                                                    <Select
                                                      value={srv.artworkStatus || ""}
                                                      onValueChange={(val: any) => {
                                                        const targetSite = formSites[siteIdx]
                                                        const currentServices = targetSite.serviceDetails || []
                                                        const currentSrv = currentServices[srvIdx]

                                                        let newColor = currentSrv.color || ""
                                                        if (val === "VECTOR_READY" || val === "NEEDS_VECTORIZATION") {
                                                          // Approach 2: Smart auto-default if empty
                                                          if (!newColor.trim()) {
                                                            newColor = "As per uploaded artwork"
                                                          }
                                                        } else if (val === "NEEDS_DESIGN" || val === "TO_BE_PROVIDED") {
                                                          // If it was the auto-default string, reset to empty
                                                          if (newColor === "As per uploaded artwork") {
                                                            newColor = ""
                                                          }
                                                        }

                                                        const updatedServices = [...currentServices]
                                                        updatedServices[srvIdx] = {
                                                          ...currentSrv,
                                                          artworkStatus: val,
                                                          color: newColor,
                                                        }
                                                        const updated = [...formSites]
                                                        updated[siteIdx] = {
                                                          ...targetSite,
                                                          serviceDetails: updatedServices,
                                                        }
                                                        setFormSites(updated)
                                                      }}
                                                    >
                                                      <SelectTrigger className="w-full h-9 bg-white border-[#DCE1E5] text-[13px] text-[#202428] data-[placeholder]:text-[#737B84] hover:border-[#b5bfc7] focus:border-[#2878D0] focus:ring-0 focus-visible:ring-1 focus-visible:ring-[#2878D0] data-[state=open]:border-[#2878D0]">
                                                        <SelectValue placeholder="Select Artwork Status..." />
                                                      </SelectTrigger>
                                                      <SelectContent className="bg-white border-[#DCE1E5] shadow-lg rounded-md z-[9999]">
                                                        <SelectItem value="VECTOR_READY" className="text-[13px]">Ready Vector (.ai / .cdr / .eps)</SelectItem>
                                                        <SelectItem value="NEEDS_VECTORIZATION" className="text-[13px]">Needs Vectorization (Photo / Scan)</SelectItem>
                                                        <SelectItem value="NEEDS_DESIGN" className="text-[13px]">Needs Artwork (Design from Scratch)</SelectItem>
                                                        <SelectItem value="TO_BE_PROVIDED" className="text-[13px]">To Be Provided Later</SelectItem>
                                                      </SelectContent>
                                                    </Select>
                                                  </div>

                                                  <div>
                                                    <Label className="text-xs font-medium text-[#737B84] block mb-1.5">
                                                      Colour / Shade Code
                                                    </Label>
                                                    <Input
                                                      type="text"
                                                      value={srv.color || ""}
                                                      placeholder="e.g. Signal Red #135 face, Matte Black returns"
                                                      className="w-full h-9 bg-white border-[#DCE1E5] text-[13px] text-[#202428] placeholder:text-[#737B84] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0]"
                                                      onChange={(e) => {
                                                        const targetSite = formSites[siteIdx]
                                                        const currentServices = targetSite.serviceDetails || []
                                                        const updatedServices = [...currentServices]
                                                        updatedServices[srvIdx] = {
                                                          ...currentServices[srvIdx],
                                                          color: e.target.value,
                                                        }
                                                        const updated = [...formSites]
                                                        updated[siteIdx] = {
                                                          ...targetSite,
                                                          serviceDetails: updatedServices,
                                                        }
                                                        setFormSites(updated)
                                                      }}
                                                    />
                                                  </div>
                                                </div>

                                                {/* Row 5: Upload Artwork & Reference Files (Only when Vector Ready or Needs Vectorization) */}
                                                {(srv.artworkStatus === "VECTOR_READY" || srv.artworkStatus === "NEEDS_VECTORIZATION") && (
                                                  <div className="mb-4">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                      <Label className="text-xs font-medium text-[#737B84]">
                                                        Upload Artwork & Reference Files
                                                      </Label>
                                                      <span className="text-[11px] text-[#737B84]">
                                                        Max file size: 50MB
                                                      </span>
                                                    </div>
                                                    <div className="printpal-dropzone-wrapper">
                                                      <ImageUpload
                                                        value={srv.referenceImages || []}
                                                        onChange={(imgs) => {
                                                          const targetSite = formSites[siteIdx]
                                                          const currentServices = targetSite.serviceDetails || []
                                                          const targetSrv = currentServices[srvIdx]
                                                          const fileNames = imgs.map((img) => img.name || img.id)

                                                          const updatedServices = [...currentServices]
                                                          updatedServices[srvIdx] = {
                                                            ...targetSrv,
                                                            referenceImages: imgs,
                                                            referenceFiles: fileNames,
                                                          }
                                                          const updated = [...formSites]
                                                          updated[siteIdx] = {
                                                            ...targetSite,
                                                            serviceDetails: updatedServices,
                                                          }
                                                          setFormSites(updated)
                                                        }}
                                                        maxFiles={10}
                                                        maxSizeMB={50}
                                                        simulateUpload={true}
                                                        title="Drop vector files or photos here, or browse"
                                                        helperText="Supports .ai, .pdf, .cdr, .dxf, .eps, .png, .jpg (Up to 50MB each)"
                                                      />
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Row 6: Fabrication Notes */}
                                                <div className="space-y-1.5">
                                                  <Label className="text-xs font-medium text-[#737B84]">Fabrication Notes</Label>
                                                  <Textarea
                                                    value={srv.notes || ""}
                                                    placeholder="Add fabrication notes, mounting details, LED specifications..."
                                                    onChange={(e) => {
                                                      const updated = [...formSites]
                                                      const srvs = [...(site.serviceDetails || [])]
                                                      srvs[srvIdx] = { ...srv, notes: e.target.value }
                                                      updated[siteIdx] = {
                                                        ...site,
                                                        serviceDetails: srvs,
                                                      }
                                                      setFormSites(updated)
                                                    }}
                                                    className="min-h-[64px] text-[13px] border-[#DCE1E5] bg-white text-[#202428] placeholder:text-[#737B84] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0]"
                                                  />
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>

                                        {/* + Add another services link */}
                                        <button
                                          type="button"
                                          id={`drawer-site-${siteIdx}-add-service`}
                                          className={`printpal-btn-add-another-service printpal-anchor-target rounded px-1.5 py-0.5 ${highlightedAnchorKey ===
                                            `drawer-site-${siteIdx}-add-service`
                                            ? "printpal-anchor-highlight"
                                            : ""
                                            }`}
                                          onClick={() => handleAddService(siteIdx)}
                                        >
                                          <Plus className="h-3.5 w-3.5" />
                                          <span>Add another service</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          {/* Add Another Site Button (36px Outline Secondary variant, no plus icon) */}
                          <div className="pt-2 flex items-center">
                            <Button
                              type="button"
                              id="drawer-add-site-btn"
                              variant="outlineSecondary"
                              size="default"
                              className={`h-9 px-4 text-[13px] font-medium rounded-md shadow-sm cursor-pointer printpal-btn-add-site-outline printpal-anchor-target ${highlightedAnchorKey === "drawer-add-site-btn"
                                ? "printpal-anchor-highlight"
                                : ""
                                }`}
                              onClick={handleAddAnotherSite}
                            >
                              Add Another Site
                            </Button>
                          </div>
                        </>
                      ) : (
                        /* ── Standalone Billing and Shipping Address Cards (Desktop - 4) ── */
                        <div className="printpal-sites-wrapper">
                          {/* ── Card 1: Billing Address ── */}
                          <div className="printpal-site-card">
                            <div className="printpal-site-card-header cursor-default">
                              <div className="printpal-site-card-title">
                                <span className="text-[13px] font-semibold text-[#202428]">
                                  Billing Address
                                </span>
                              </div>
                            </div>

                            <div className="printpal-site-card-body">
                              <div className="printpal-site-info-fields" style={{ padding: "16px" }}>
                                {/* Billing Entity & GSTIN */}
                                <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
                                  <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                    <Label className="printpal-form-label">Billing Entity / Company Name</Label>
                                    <Input
                                      type="text"
                                      className="printpal-form-input"
                                      value={
                                        billingDetails.billingName ||
                                        formBasicDetails.businessName ||
                                        formBasicDetails.primaryContactName ||
                                        ""
                                      }
                                      placeholder="e.g. Acme Corp India Pvt Ltd"
                                      onChange={(e) =>
                                        setBillingDetails((prev) => ({
                                          ...prev,
                                          billingName: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                    <Label className="printpal-form-label">
                                      GSTIN (Optional / Tax Registered)
                                    </Label>
                                    <Input
                                      type="text"
                                      className={`printpal-form-input uppercase ${formErrors.gstin ? "printpal-input-error border-red-500" : ""}`}
                                      value={billingDetails.gstin}
                                      placeholder="33AAAAA0000A1Z5"
                                      onChange={(e) => {
                                        const val = e.target.value.toUpperCase()
                                        setBillingDetails((prev) => ({ ...prev, gstin: val }))
                                        if (formErrors.gstin) {
                                          setFormErrors((prev) => {
                                            const next = { ...prev }
                                            delete next.gstin
                                            return next
                                          })
                                        }
                                      }}
                                    />
                                    {formErrors.gstin && (
                                      <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                                        <AlertCircle className="h-3 w-3 shrink-0" />
                                        {formErrors.gstin}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Address Line 1 & Line 2 */}
                                <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
                                  <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                    <Label className="printpal-form-label">Address Line 1</Label>
                                    <Input
                                      type="text"
                                      className="printpal-form-input"
                                      value={billingDetails.billingAddressLine1}
                                      placeholder="No.1/16 abc street, DEF nagar"
                                      onChange={(e) => {
                                        const l1 = e.target.value
                                        setBillingDetails((prev) => ({
                                          ...prev,
                                          billingAddressLine1: l1,
                                          billingAddress: [l1, prev.billingAddressLine2, prev.city, prev.state, prev.pincode].filter(Boolean).join(", "),
                                        }))
                                      }}
                                    />
                                  </div>
                                  <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                    <Label className="printpal-form-label">Address Line 2</Label>
                                    <Input
                                      type="text"
                                      className="printpal-form-input"
                                      value={billingDetails.billingAddressLine2}
                                      placeholder="e.g. Near Industrial Estate, Guindy"
                                      onChange={(e) => {
                                        const l2 = e.target.value
                                        setBillingDetails((prev) => ({
                                          ...prev,
                                          billingAddressLine2: l2,
                                          billingAddress: [prev.billingAddressLine1, l2, prev.city, prev.state, prev.pincode].filter(Boolean).join(", "),
                                        }))
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* City, State, Pincode */}
                                <div className="printpal-form-row-3" style={{ marginBottom: 0 }}>
                                  <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                    <Label className="printpal-form-label">City</Label>
                                    <Input
                                      type="text"
                                      className="printpal-form-input"
                                      value={billingDetails.city}
                                      onChange={(e) => {
                                        const c = e.target.value
                                        setBillingDetails((prev) => ({
                                          ...prev,
                                          city: c,
                                          billingAddress: [prev.billingAddressLine1, prev.billingAddressLine2, c, prev.state, prev.pincode].filter(Boolean).join(", "),
                                        }))
                                      }}
                                    />
                                  </div>
                                  <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                    <Label className="printpal-form-label">State</Label>
                                    <Input
                                      type="text"
                                      className="printpal-form-input"
                                      value={billingDetails.state}
                                      onChange={(e) => {
                                        const s = e.target.value
                                        setBillingDetails((prev) => ({
                                          ...prev,
                                          state: s,
                                          billingAddress: [prev.billingAddressLine1, prev.billingAddressLine2, prev.city, s, prev.pincode].filter(Boolean).join(", "),
                                        }))
                                      }}
                                    />
                                  </div>
                                  <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                    <Label className="printpal-form-label">Pincode</Label>
                                    <Input
                                      type="text"
                                      className={`printpal-form-input ${formErrors.billingPincode ? "printpal-input-error border-red-500" : ""}`}
                                      value={billingDetails.pincode}
                                      placeholder="600051"
                                      onChange={(e) => {
                                        const p = e.target.value
                                        setBillingDetails((prev) => ({
                                          ...prev,
                                          pincode: p,
                                          billingAddress: [prev.billingAddressLine1, prev.billingAddressLine2, prev.city, prev.state, p].filter(Boolean).join(", "),
                                        }))
                                        if (formErrors.billingPincode) {
                                          setFormErrors((prev) => {
                                            const next = { ...prev }
                                            delete next.billingPincode
                                            return next
                                          })
                                        }
                                      }}
                                    />
                                    {formErrors.billingPincode && (
                                      <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                                        <AlertCircle className="h-3 w-3 shrink-0" />
                                        {formErrors.billingPincode}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 6. Interactive Multi-Site Modal (Desktop - 2) ── */}
      {selectedCustomerForSites && (
        <div
          className="printpal-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedCustomerForSites(null)
            }
          }}
        >
          <div className="printpal-modal-card" role="dialog" aria-modal="true">
            <div className="printpal-modal-head">
              <h3 className="printpal-modal-title">
                {selectedCustomerForSites.name} — All Installation Sites
              </h3>
              <button
                type="button"
                className="printpal-modal-close-btn"
                onClick={() => setSelectedCustomerForSites(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="printpal-modal-body">
              {selectedCustomerForSites.sites?.map((site, sIdx) => (
                <div key={site.id} className="printpal-site-list-item">
                  <div className="printpal-site-list-item-title">
                    {site.siteName || `Site ${sIdx + 1}`}
                  </div>
                  <div className="printpal-site-list-item-address">{site.address}</div>
                  <div className="printpal-site-list-item-tags">
                    {site.targetDeliveryDate && (
                      <span className="printpal-tag">Delivery: {site.targetDeliveryDate}</span>
                    )}
                    {site.contactPerson && (
                      <span className="printpal-tag">
                        Contact: {site.contactPerson} {site.contactPhone ? `(${site.contactPhone})` : ""}
                      </span>
                    )}
                    <span className="printpal-tag">{site.wallSubstrate || "Concrete"}</span>
                    {site.serviceDetails && site.serviceDetails.length > 0 ? (
                      site.serviceDetails.map((srv, idx) => (
                        <span key={srv.id || idx} className="printpal-tag">
                          {srv.signStyle || `Service ${idx + 1}`}
                          {srv.width && srv.height ? ` (${srv.width}x${srv.height} ${srv.unit || "ft"})` : ""}
                          {srv.material ? ` · ${srv.material}` : ""}
                          {srv.finishing ? ` · ${srv.finishing}` : ""}
                          {srv.color ? ` · Colour: ${srv.color}` : ""}
                          {srv.artworkStatus === "VECTOR_READY" ? " · Vector Ready" : srv.artworkStatus === "NEEDS_DESIGN" ? " · Needs Artwork" : srv.artworkStatus === "NEEDS_VECTORIZATION" ? " · Needs Tracing" : ""}
                        </span>
                      ))
                    ) : (
                      site.services?.map((srv) => (
                        <span key={srv} className="printpal-tag">
                          {srv}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}





      {/* ── 7.5. Quick Add Product Pop-up Modal (Untitled UI / UI Library) ── */}
      {isQuickProductModalOpen && (
        <Modal
          open={isQuickProductModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsQuickProductModalOpen(false)
              setQuickProductName("")
              setQuickProductDesc("")
              setQuickProductSelectedMats([])
              setQuickProductSelectedFins([])
              setQuickTargetService(null)
              setQuickProductError(null)
            }
          }}
        >
          <ModalContent size="md">
            <ModalHeader>
              <ModalIconBadge variant="brand" shape="square" className="mb-3">
                <Package className="h-5 w-5 stroke-[2.5]" />
              </ModalIconBadge>
              <ModalTitle>Add New Product</ModalTitle>
              <ModalDescription>
                Create a new signage product with tagged materials and finishes for your catalogue.
              </ModalDescription>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#344054]" htmlFor="quick-prod-title">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quick-prod-title"
                    placeholder="e.g. 3D Acrylic Lettering"
                    className={`printpal-form-input ${quickProductError ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={quickProductName}
                    autoFocus
                    onChange={(e) => {
                      setQuickProductName(e.target.value)
                      if (quickProductError) setQuickProductError(null)
                    }}
                  />
                  {quickProductError && (
                    <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {quickProductError}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#344054]" htmlFor="quick-prod-desc">
                    Product Description
                  </Label>
                  <Textarea
                    id="quick-prod-desc"
                    placeholder="Brief description of the product specification..."
                    value={quickProductDesc}
                    onChange={(e) => setQuickProductDesc(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#344054]">
                    Materials that can be used ({quickProductSelectedMats.length} selected)
                  </Label>
                  <div className="max-h-36 overflow-y-auto border border-[#DCE1E5] rounded-md p-2 space-y-1">
                    {materials.length === 0 ? (
                      <p className="text-xs text-[#737B84] py-1">No materials created yet.</p>
                    ) : (
                      materials.map((m) => (
                        <label
                          key={m.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#F4F7FA] cursor-pointer text-xs text-[#202428] transition-colors select-none"
                        >
                          <Checkbox
                            checked={quickProductSelectedMats.includes(m.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setQuickProductSelectedMats((prev) => [...prev, m.id])
                              } else {
                                setQuickProductSelectedMats((prev) => prev.filter((id) => id !== m.id))
                              }
                            }}
                          />
                          <span>{m.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#344054]">
                    Finishes that can be done ({quickProductSelectedFins.length} selected)
                  </Label>
                  <div className="max-h-36 overflow-y-auto border border-[#DCE1E5] rounded-md p-2 space-y-1">
                    {finishes.length === 0 ? (
                      <p className="text-xs text-[#737B84] py-1">No finishes created yet.</p>
                    ) : (
                      finishes.map((f) => (
                        <label
                          key={f.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#F4F7FA] cursor-pointer text-xs text-[#202428] transition-colors select-none"
                        >
                          <Checkbox
                            checked={quickProductSelectedFins.includes(f.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setQuickProductSelectedFins((prev) => [...prev, f.id])
                              } else {
                                setQuickProductSelectedFins((prev) => prev.filter((id) => id !== f.id))
                              }
                            }}
                          />
                          <span>{f.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter layout="horizontal">
              <ModalButton
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsQuickProductModalOpen(false)
                  setQuickProductName("")
                  setQuickProductDesc("")
                  setQuickProductSelectedMats([])
                  setQuickProductSelectedFins([])
                  setQuickTargetService(null)
                  setQuickProductError(null)
                }}
              >
                Cancel
              </ModalButton>
              <ModalButton
                variant="primary"
                type="button"
                onClick={handleSaveQuickProduct}
              >
                Save
              </ModalButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}







      {/* ── 9b. Add / Edit Tax Pop-up Modal ── */}
      {isTaxModalOpen && (
        <Modal
          open={isTaxModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditingTax(null)
              setTaxForm({ name: "", percentage: "" })
              setTaxErrors({})
              setIsTaxModalOpen(false)
            }
          }}
        >
          <ModalContent size="md">
            <ModalHeader>
              <ModalIconBadge variant="brand" shape="square" className="mb-3">
                {editingTax ? <Edit3 className="h-5 w-5 stroke-[2.5]" /> : <Plus className="h-5 w-5 stroke-[2.5]" />}
              </ModalIconBadge>
              <ModalTitle>{editingTax ? "Edit Tax" : "Add Tax"}</ModalTitle>
              <ModalDescription>
                {editingTax
                  ? "Update the tax name and rate percentage."
                  : "Enter the tax identification name and percentage rate."}
              </ModalDescription>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#344054]" htmlFor="quick-tax-name">
                    Tax Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quick-tax-name"
                    placeholder="e.g. CGST, SGST, IGST"
                    className={`printpal-form-input ${taxErrors.name ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={taxForm.name}
                    autoFocus
                    onChange={(e) => {
                      setTaxForm((prev) => ({ ...prev, name: e.target.value }))
                      if (taxErrors.name) setTaxErrors((prev) => ({ ...prev, name: undefined }))
                    }}
                  />
                  {taxErrors.name && (
                    <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {taxErrors.name}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#344054]" htmlFor="quick-tax-percentage">
                    Percentage (%) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quick-tax-percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g. 9 or 18"
                    className={`printpal-form-input ${taxErrors.percentage ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={taxForm.percentage}
                    onChange={(e) => {
                      setTaxForm((prev) => ({ ...prev, percentage: e.target.value }))
                      if (taxErrors.percentage) setTaxErrors((prev) => ({ ...prev, percentage: undefined }))
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleSaveTax()
                      }
                    }}
                  />
                  {taxErrors.percentage && (
                    <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {taxErrors.percentage}
                    </span>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter layout="horizontal">
              <ModalButton
                variant="secondary"
                type="button"
                onClick={() => {
                  setEditingTax(null)
                  setTaxForm({ name: "", percentage: "" })
                  setTaxErrors({})
                  setIsTaxModalOpen(false)
                }}
              >
                Cancel
              </ModalButton>
              <ModalButton
                variant="primary"
                type="button"
                onClick={handleSaveTax}
              >
                {editingTax ? "Save Changes" : "Add Tax"}
              </ModalButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  )
}

function createDefaultSite(siteNumber: number): SiteRecord {
  return {
    id: `site-${Date.now()}-${siteNumber}`,
    siteName: "",
    address: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    targetDeliveryDate: "",
    contactPerson: "",
    contactPhone: "",
    services: ["ACP Glow Sign"],
    mountingHeightAglFt: 10,
    wallSubstrate: "ACP",
    hasPowerPoint: true,
    powerDistanceM: 2.5,
    serviceDetails: [
      {
        id: `srv-${Date.now()}-1`,
        serviceNumber: 1,
        signStyle: "",
        application: "Outdoor",
        width: "",
        height: "",
        unit: "ft",
        quantity: 1,
        notSureOfDimensions: false,
        material: "",
        finishing: "",
        artworkStatus: "",
        color: "",
        referenceFiles: [],
        referenceImages: [],
        notes: "",
      },
    ],
  }
}
