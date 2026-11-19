import * as React from "react";
import {
  AlertCircle,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { Button, Input, Label, Textarea } from "@printpal/ui"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { ImageUpload, type ImageUploadItem } from "@/components/ui/image-upload";
import type { BusinessDetailsRecord } from "./businessDetails.types";
import { validateBusinessDetails } from "./businessDetails.validation";

export interface TaxOptionRecord {
  id: string;
  name: string;
  percentage: number;
}

export interface BusinessDetailsViewProps {
  value: BusinessDetailsRecord;
  taxes: TaxOptionRecord[];
  applyTaxesToSaleableItems: boolean;
  onSave: (updated: BusinessDetailsRecord) => Promise<void> | void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

interface GeoapifyPlaceOption {
  id: string;
  name: string;
  formattedAddress: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const GEOAPIFY_API_KEY = (import.meta.env.VITE_GEOAPIFY_API_KEY as string) || "";

const COUNTRY_OPTIONS = [
  "India",
  "United Arab Emirates",
  "Singapore",
  "United States",
  "United Kingdom",
  "Malaysia",
  "Saudi Arabia",
  "Other",
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function renderFieldError(message?: string) {
  if (!message) return null;
  return (
    <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </span>
  );
}

export function BusinessDetailsView({
  value,
  taxes,
  applyTaxesToSaleableItems,
  onSave,
  showToast,
}: BusinessDetailsViewProps) {
  const [form, setForm] = React.useState<BusinessDetailsRecord>(value);
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof BusinessDetailsRecord, string>>
  >({});
  const [isSaving, setIsSaving] = React.useState(false);

  // Separate UI item arrays so ImageUpload progress animation stays smooth without blob->data flicker
  const [logoItems, setLogoItems] = React.useState<ImageUploadItem[]>(() =>
    value.logoUrl
      ? [{ id: "biz-logo", url: value.logoUrl, name: "Company Logo", progress: 100 }]
      : []
  );
  const [signatureItems, setSignatureItems] = React.useState<ImageUploadItem[]>(() =>
    value.signatureUrl
      ? [{ id: "biz-sig", url: value.signatureUrl, name: "Authorized Signature", progress: 100 }]
      : []
  );

  // Reused Customer Drawer Sites-card Geoapify search state
  const [addressQuery, setAddressQuery] = React.useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isSearchingPlaces, setIsSearchingPlaces] = React.useState(false);
  const [placeSuggestions, setPlaceSuggestions] = React.useState<GeoapifyPlaceOption[]>([]);
  const searchBoxRef = React.useRef<HTMLDivElement>(null);

  // Sync incoming persisted state on initial backend load
  React.useEffect(() => {
    setForm(value);
    setLogoItems(
      value.logoUrl
        ? [{ id: "biz-logo", url: value.logoUrl, name: "Company Logo", progress: 100 }]
        : []
    );
    setSignatureItems(
      value.signatureUrl
        ? [{ id: "biz-sig", url: value.signatureUrl, name: "Authorized Signature", progress: 100 }]
        : []
    );
  }, [value]);

  // Close address search dropdown on outside click
  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Geoapify Places lookup (mirrors Customer Drawer Sites card)
  React.useEffect(() => {
    const q = addressQuery.trim();
    if (!isDropdownOpen || q.length < 2 || !GEOAPIFY_API_KEY) {
      setPlaceSuggestions([]);
      setIsSearchingPlaces(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&limit=5&apiKey=${GEOAPIFY_API_KEY}`
        );
        if (!res.ok) throw new Error("Geocode lookup failed");
        const data = await res.json();
        if (cancelled) return;
        const mapped: GeoapifyPlaceOption[] = (data.features || []).map((feat: any, idx: number) => {
          const p = feat.properties || {};
          return {
            id: p.place_id || `place-${idx}`,
            name: p.name || p.address_line1 || p.formatted || "",
            formattedAddress: p.formatted || "",
            addressLine1: [p.housenumber, p.street].filter(Boolean).join(" ") || p.address_line1 || p.name || "",
            addressLine2: p.suburb || p.district || p.neighbourhood || "",
            city: p.city || p.town || p.village || p.state_district || "",
            state: p.state || "",
            pincode: p.postcode || "",
            country: p.country || "India",
          };
        });
        setPlaceSuggestions(mapped);
      } catch {
        if (!cancelled) setPlaceSuggestions([]);
      } finally {
        if (!cancelled) setIsSearchingPlaces(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [addressQuery, isDropdownOpen]);

  const updateField = <K extends keyof BusinessDetailsRecord>(
    field: K,
    nextVal: BusinessDetailsRecord[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: nextVal }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSelectGeoapifyPlace = (place: GeoapifyPlaceOption) => {
    setAddressQuery(place.formattedAddress || place.name);
    setIsDropdownOpen(false);
    setForm((prev) => ({
      ...prev,
      addressLine1: place.addressLine1 || prev.addressLine1,
      addressLine2: place.addressLine2 || prev.addressLine2,
      city: place.city || prev.city,
      state: place.state || prev.state,
      pincode: place.pincode || prev.pincode,
      country: COUNTRY_OPTIONS.includes(place.country) ? place.country : prev.country || "India",
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.addressLine1;
      delete next.city;
      delete next.state;
      delete next.pincode;
      delete next.country;
      return next;
    });
  };

  const handleLogoFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      updateField("logoUrl", dataUrl);
      showToast("Logo added. Save to use it on your quotes.", "success");
    } catch {
      showToast("Couldn't read that image. Try a PNG or JPG.", "error");
    }
  };

  const handleSignatureFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      updateField("signatureUrl", dataUrl);
      showToast("Signature added. Save to use it on your quotes.", "success");
    } catch {
      showToast("Couldn't read that image. Try a PNG or JPG.", "error");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const normalized: BusinessDetailsRecord = {
      ...form,
      legalName: form.legalName.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      country: form.country.trim() || "India",
      gstin: form.gstin.trim().toUpperCase(),
      pan: form.pan.trim().toUpperCase(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      website: form.website.trim(),
      signatoryName: form.signatoryName.trim(),
      defaultTerms: form.defaultTerms.trim(),
    };

    const validation = validateBusinessDetails(normalized);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(normalized);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-3xl mx-auto flex flex-col gap-5 pb-8"
    >
      {/* ── Page Header ── */}
      <section className="flex items-start justify-between gap-4">
        <div className="printpal-leads-title-block">
          <h1 className="printpal-leads-title">Business Details</h1>
          <div className="printpal-leads-subtitle">
            Manage your legal identity, registered office address, statutory GST/PAN details, and default quotation terms
          </div>
        </div>
      </section>

      {/* ── Card 1: Company Logo & Legal / Display Name ── */}
      <Card className="bg-white border-[#DCE1E5] rounded-[12px] shadow-none">
        <CardHeader className="pb-4 border-b border-[#F1F5F9]">
          <CardTitle className="text-[15px] font-semibold text-[#202428]">
            Brand Identity
          </CardTitle>
          <CardDescription className="text-[12px] text-[#737B84]">
            Displayed on the letterhead of customer quotations and generated PDF documents
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          <div>
            <Label className="printpal-form-label mb-1.5 block">Company Logo</Label>
            <ImageUpload
              value={logoItems}
              maxFiles={1}
              maxSizeMB={2}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              title="Click to upload logo"
              helperText="PNG, JPG, WebP or SVG up to 2MB"
              onFilesSelected={handleLogoFiles}
              onChange={(items) => {
                setLogoItems(items);
                if (items.length === 0 && form.logoUrl) {
                  updateField("logoUrl", "");
                }
              }}
            />
          </div>

          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
            <Label className="printpal-form-label" htmlFor="biz-legal-name">
              Legal / Display Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="biz-legal-name"
              type="text"
              placeholder="e.g. PrintPal Solutions Pvt. Ltd."
              className={`printpal-form-input ${errors.legalName ? "printpal-input-error border-red-500 focus-visible:border-red-500" : ""}`}
              value={form.legalName}
              onChange={(e) => updateField("legalName", e.target.value)}
            />
            {renderFieldError(errors.legalName)}
          </div>
        </CardContent>
      </Card>

      {/* ── Card 2: Registered Address (Reused Customer Drawer Sites Card Pattern) ── */}
      <Card className="bg-white border-[#DCE1E5] rounded-[12px] shadow-none">
        <CardHeader className="pb-4 border-b border-[#F1F5F9]">
          <CardTitle className="text-[15px] font-semibold text-[#202428]">
            Registered Address
          </CardTitle>
          <CardDescription className="text-[12px] text-[#737B84]">
            Official registered business address printed on quotations and tax documents
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="printpal-site-info-fields" style={{ padding: "20px" }}>
            {/* Location Autocomplete Search (matching Customer Drawer Sites Card) */}
            <div className="printpal-search-row" ref={searchBoxRef}>
              <div className="printpal-site-search-wrapper relative">
                <Search className="printpal-search-icon" />
                <Input
                  type="text"
                  className="printpal-site-search-input pr-8"
                  placeholder="Search registered office location (building, street, or area)"
                  value={addressQuery}
                  autoComplete="off"
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setAddressQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                />
                {addressQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddressQuery("");
                      setPlaceSuggestions([]);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737B84] hover:text-[#202428] cursor-pointer p-1"
                    title="Clear address search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {isDropdownOpen && (
                  <div className="printpal-maps-autocomplete-dropdown">
                    <div className="printpal-maps-dropdown-header">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#737B84] uppercase tracking-wider">
                        <MapPin className="h-3 w-3 text-[#2878D0]" />
                        Geoapify Places
                      </span>
                    </div>
                    <div className="printpal-maps-dropdown-list">
                      {!GEOAPIFY_API_KEY ? (
                        <div className="p-3 text-center text-[12px]/4 text-[#737B84]">
                          Enter registered address manually below or configure <code className="bg-gray-100 text-[#2878D0] px-1 py-0.5 rounded font-sans text-[10px]">VITE_GEOAPIFY_API_KEY</code>.
                        </div>
                      ) : isSearchingPlaces ? (
                        <div className="p-4 text-center text-[12px]/4 text-[#737B84] flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-[spin_1s_linear_infinite] text-[#2878D0]" />
                          <span>Searching places...</span>
                        </div>
                      ) : placeSuggestions.length > 0 ? (
                        placeSuggestions.map((place) => (
                          <div
                            key={place.id}
                            className="printpal-maps-dropdown-item"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectGeoapifyPlace(place);
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
                      ) : addressQuery.trim().length >= 2 ? (
                        <div className="p-3 text-center text-[12px]/4 text-[#737B84]">
                          No results found for "{addressQuery}".
                        </div>
                      ) : (
                        <div className="p-3 text-center text-[12px]/4 text-[#737B84]">
                          Type 2 or more characters to search locations...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="printpal-manual-address-link"
              onClick={() => document.getElementById("biz-addr-line1")?.focus()}
            >
              Can&apos;t find it ? Enter address manually
            </div>

            {/* Address Line 1 & Address Line 2 (2 Columns) */}
            <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                <Label className="printpal-form-label" htmlFor="biz-addr-line1">
                  Address Line 1 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="biz-addr-line1"
                  type="text"
                  placeholder="e.g. No. 14, SIDCO Industrial Estate"
                  className={`printpal-form-input ${errors.addressLine1 ? "printpal-input-error border-red-500 focus-visible:border-red-500" : ""}`}
                  value={form.addressLine1}
                  onChange={(e) => updateField("addressLine1", e.target.value)}
                />
                {renderFieldError(errors.addressLine1)}
              </div>

              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                <Label className="printpal-form-label" htmlFor="biz-addr-line2">
                  Address Line 2
                </Label>
                <Input
                  id="biz-addr-line2"
                  type="text"
                  placeholder="e.g. Guindy, 3rd Phase"
                  className="printpal-form-input"
                  value={form.addressLine2}
                  onChange={(e) => updateField("addressLine2", e.target.value)}
                />
              </div>
            </div>

            {/* City & State (2 Columns) */}
            <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                <Label className="printpal-form-label" htmlFor="biz-city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="biz-city"
                  type="text"
                  placeholder="e.g. Chennai"
                  className={`printpal-form-input ${errors.city ? "printpal-input-error border-red-500 focus-visible:border-red-500" : ""}`}
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
                {renderFieldError(errors.city)}
              </div>

              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                <Label className="printpal-form-label" htmlFor="biz-state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="biz-state"
                  type="text"
                  placeholder="e.g. Tamil Nadu"
                  className={`printpal-form-input ${errors.state ? "printpal-input-error border-red-500 focus-visible:border-red-500" : ""}`}
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                />
                {renderFieldError(errors.state)}
              </div>
            </div>

            {/* Pincode & Country (2 Columns) */}
            <div className="printpal-form-row-2" style={{ marginBottom: 0 }}>
              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                <Label className="printpal-form-label" htmlFor="biz-pincode">
                  Pincode <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="biz-pincode"
                  type="text"
                  placeholder="e.g. 600032"
                  className={`printpal-form-input ${errors.pincode ? "printpal-input-error border-red-500 focus-visible:border-red-500" : ""}`}
                  value={form.pincode}
                  onChange={(e) => updateField("pincode", e.target.value)}
                />
                {renderFieldError(errors.pincode)}
              </div>

              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                <Label className="printpal-form-label" htmlFor="biz-country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={COUNTRY_OPTIONS.includes(form.country) ? form.country : "Other"}
                  onValueChange={(val) => updateField("country", val)}
                >
                  <SelectTrigger
                    id="biz-country"
                    className={errors.country ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderFieldError(errors.country)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 3: Statutory Tax Details (GSTIN + Default Tax Dropdown + PAN) ── */}
      <Card className="bg-white border-[#DCE1E5] rounded-[12px] shadow-none">
        <CardHeader className="pb-4 border-b border-[#F1F5F9]">
          <CardTitle className="text-[15px] font-semibold text-[#202428]">
            Tax &amp; Statutory Registration
          </CardTitle>
          <CardDescription className="text-[12px] text-[#737B84]">
            15-character GSTIN, PAN, and default statutory tax fetched from Settings → Quotation → Tax
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="printpal-form-group" style={{ marginBottom: 0 }}>
              <Label className="printpal-form-label" htmlFor="biz-gstin">
                GSTIN
              </Label>
              <Input
                id="biz-gstin"
                type="text"
                maxLength={15}
                placeholder="33AAAAA0000A1Z5"
                className={`printpal-form-input uppercase font-sans ${errors.gstin ? "printpal-input-error border-red-500 focus-visible:border-red-500" : ""}`}
                value={form.gstin}
                onChange={(e) => updateField("gstin", e.target.value.toUpperCase())}
              />
              {renderFieldError(errors.gstin)}
            </div>

            <div className="printpal-form-group" style={{ marginBottom: 0 }}>
              <Label className="printpal-form-label" htmlFor="biz-default-tax">
                Default Tax (from Tax Settings)
              </Label>
              <Select
                disabled={!applyTaxesToSaleableItems}
                value={form.defaultTaxId || "__none__"}
                onValueChange={(val) =>
                  updateField("defaultTaxId", val === "__none__" ? "" : val)
                }
              >
                <SelectTrigger id="biz-default-tax">
                  <SelectValue placeholder="Select configured tax" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No default tax</SelectItem>
                  {taxes.map((tax) => (
                    <SelectItem key={tax.id} value={tax.id}>
                      {tax.name} ({tax.percentage}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!applyTaxesToSaleableItems && (
                <span className="text-[11px] text-[#737B84] mt-1 block">
                  Tax application is currently disabled in Quotation → Tax settings.
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="printpal-form-group" style={{ marginBottom: 0 }}>
              <Label className="printpal-form-label" htmlFor="biz-pan">
                PAN <span className="text-[#94A3B8] font-normal">(Optional)</span>
              </Label>
              <Input
                id="biz-pan"
                type="text"
                maxLength={10}
                placeholder="ABCDE1234F"
                className={`printpal-form-input uppercase font-sans ${errors.pan ? "printpal-input-error border-red-500 focus-visible:border-red-500" : ""}`}
                value={form.pan}
                onChange={(e) => updateField("pan", e.target.value.toUpperCase())}
              />
              {renderFieldError(errors.pan)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 4: Business Contact Details ── */}
      <Card className="bg-white border-[#DCE1E5] rounded-[12px] shadow-none">
        <CardHeader className="pb-4 border-b border-[#F1F5F9]">
          <CardTitle className="text-[15px] font-semibold text-[#202428]">
            Contact Details
          </CardTitle>
          <CardDescription className="text-[12px] text-[#737B84]">
            Official phone number, billing email, and company website shown to customers
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="printpal-form-group" style={{ marginBottom: 0 }}>
              <Label className="printpal-form-label" htmlFor="biz-phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="biz-phone"
                type="tel"
                placeholder="+91 98401 23456"
                className={`printpal-form-input ${errors.phone ? "printpal-input-error border-red-500 focus-visible:border-red-500" : ""}`}
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
              {renderFieldError(errors.phone)}
            </div>

            <div className="printpal-form-group" style={{ marginBottom: 0 }}>
              <Label className="printpal-form-label" htmlFor="biz-email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="biz-email"
                type="email"
                placeholder="quotes@printpal.in"
                className={`printpal-form-input ${errors.email ? "printpal-input-error border-red-500 focus-visible:border-red-500" : ""}`}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
              {renderFieldError(errors.email)}
            </div>

            <div className="printpal-form-group" style={{ marginBottom: 0 }}>
              <Label className="printpal-form-label" htmlFor="biz-website">
                Website <span className="text-[#94A3B8] font-normal">(Optional)</span>
              </Label>
              <Input
                id="biz-website"
                type="url"
                placeholder="https://printpal.in"
                className={`printpal-form-input ${errors.website ? "printpal-input-error border-red-500 focus-visible:border-red-500" : ""}`}
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
              />
              {renderFieldError(errors.website)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 5: Authorized Signatory, Signature Upload & Default Terms ── */}
      <Card className="bg-white border-[#DCE1E5] rounded-[12px] shadow-none">
        <CardHeader className="pb-4 border-b border-[#F1F5F9]">
          <CardTitle className="text-[15px] font-semibold text-[#202428]">
            Signatory &amp; Default Terms
          </CardTitle>
          <CardDescription className="text-[12px] text-[#737B84]">
            Authorized signatory and default commercial terms stamped onto customer quotations
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
            <Label className="printpal-form-label" htmlFor="biz-signatory-name">
              Authorized Signatory Name
            </Label>
            <Input
              id="biz-signatory-name"
              type="text"
              placeholder="e.g. Rajesh Kumar, Managing Partner"
              className="printpal-form-input"
              value={form.signatoryName}
              onChange={(e) => updateField("signatoryName", e.target.value)}
            />
          </div>

          <div>
            <Label className="printpal-form-label mb-1.5 block">Signature Image</Label>
            <ImageUpload
              value={signatureItems}
              maxFiles={1}
              maxSizeMB={2}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              title="Click to upload signature"
              helperText="Transparent PNG or JPG up to 2MB"
              onFilesSelected={handleSignatureFiles}
              onChange={(items) => {
                setSignatureItems(items);
                if (items.length === 0 && form.signatureUrl) {
                  updateField("signatureUrl", "");
                }
              }}
            />
          </div>

          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
            <Label className="printpal-form-label" htmlFor="biz-default-terms">
              Default Terms &amp; Conditions
            </Label>
            <Textarea
              id="biz-default-terms"
              rows={4}
              placeholder="Enter default payment milestones, warranty, delivery, and installation terms..."
              className="text-[13px] leading-relaxed"
              value={form.defaultTerms}
              onChange={(e) => updateField("defaultTerms", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Bottom Save Bar ── */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <Button
          type="submit"
          variant="orange"
          disabled={isSaving}
          className="printpal-btn-primary font-medium min-w-[164px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-[spin_1s_linear_infinite]" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Business Details</span>
          )}
        </Button>
      </div>
    </form>
  );
}

