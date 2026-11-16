import React from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Mail,
  Info,
  AlertCircle,
  X,
} from 'lucide-react';
import { QuotePDFPreview } from './QuotePDFPreview';
import { Button } from '@ui/button';
import { palNotch } from '@ui/pal-notch';
import { Input } from '@ui/input';
import { Textarea } from '@ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';
import { BadgeGroup } from '@ui/badge-group';
import type {
  CustomerRecord,
  ProductRecord,
  MaterialRecord,
  FinishRecord,
  SiteRecord,
  CustomerDrawerAnchor,
} from './types';
import {
  calcLine,
  METHOD_MAP,
  convertDimension,
  mapLegacyMethodCode,
} from '../quotation/calcLine';
import type { MethodCode } from '../quotation/calcLine';
import type { BusinessDetailsRecord } from '../settings';

export interface RenegotiatingQuoteData {
  originalQuoteNumber: string;
  quoteNumber: string;
  versionNumber: number;
  versionLabel: string;
  customer: CustomerRecord;
  sites: QuoteSite[];
  subtotal?: number;
  transportCost?: number;
  designCharges?: number;
  installationCharges?: number;
  discountPercent?: number;
  gstRate?: number;
  fabNotes?: string;
  commercialTerms?: string;
}

export interface QuotationViewProps {
  customers: CustomerRecord[];
  products: ProductRecord[];
  materials: MaterialRecord[];
  finishes: FinishRecord[];
  onOpenCustomerDrawer: (
    isEditing: boolean,
    customer?: CustomerRecord,
    title?: string,
    anchor?: CustomerDrawerAnchor
  ) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  initialCustomer?: CustomerRecord | null;
  businessDetails?: BusinessDetailsRecord;
  isSupplierEnabled?: boolean;
  renegotiatingQuote?: RenegotiatingQuoteData | null;
  onClearRenegotiatingQuote?: () => void;
}

export type PricingMethod =
  | 'Square Feet'
  | 'Feet'
  | 'Per piece'
  | 'Lump sum'
  | 'Metre'
  | 'Metre square';

export interface QuoteLineItem {
  id: string;
  productTitle: string;
  materialName?: string;
  finishName?: string;
  method?: PricingMethod | string;
  methodCode: MethodCode;
  methodName?: string;
  rateLabel?: string;
  size?: string;
  width?: string | number | null;
  height?: string | number | null;
  qty: number;
  quantity?: number;
  price?: number | null;
  rate?: number | null;
  discount: number; // in %
  discountPct?: number;
  billableQty?: number | null;
  total: number | null;
  status?: 'ok' | 'incomplete';
  reason?: 'size' | 'rate' | 'quantity' | 'discount';
}

export interface QuoteSite {
  id: string;
  siteName: string;
  address?: string;
  isExpanded: boolean;
  items: QuoteLineItem[];
}

/**
 * Maps Customer Site Records to Quotation Sites strictly from what exists in customer profile.
 * Converts dimensions to method size_unit (up to 3 decimals).
 * Starts rate empty and discount at 0.
 */
function mapCustomerSitesToQuoteSites(
  customerSites: SiteRecord[],
  availableProducts: ProductRecord[] = []
): QuoteSite[] {
  if (!customerSites || customerSites.length === 0) return [];

  return customerSites.map((site, sIdx) => ({
    id: site.id || `site-${sIdx + 1}`,
    siteName: site.siteName || `Site ${sIdx + 1}`,
    address: site.address,
    isExpanded: true,
    items:
      site.serviceDetails && site.serviceDetails.length > 0
        ? site.serviceDetails.map((srv: any, iIdx: number) => {
          const matchedProd = availableProducts.find(
            (p) => p.title.toLowerCase() === (srv.signStyle || '').toLowerCase()
          );
          const defaultMethodCode: MethodCode = matchedProd?.unit
            ? mapLegacyMethodCode(matchedProd.unit)
            : 'sq_ft';
          const method = METHOD_MAP[defaultMethodCode] || METHOD_MAP.sq_ft;

          let widthStr = '';
          let heightStr = '';

          const isDimensionUnsure = srv.notSureDimensions || srv.isDimensionUnsure;
          const hasRawDims = !isDimensionUnsure && srv.width && Number(srv.width) > 0;

          if (hasRawDims) {
            const fromUnit = (srv.unit || 'mm').toLowerCase() as 'ft' | 'in' | 'mm' | 'm';
            const targetUnit = method.size_unit || 'ft';

            const convertedW = convertDimension(Number(srv.width), fromUnit, targetUnit);
            widthStr = String(convertedW);

            if (method.type === 'area' && srv.height && Number(srv.height) > 0) {
              const convertedH = convertDimension(Number(srv.height), fromUnit, targetUnit);
              heightStr = String(convertedH);
            }
          }

          const quantity = method.type === 'fixed' ? 1 : Math.max(1, parseInt(String(srv.quantity || 1)) || 1);
          const rateVal = null; // Rate starts empty
          const discountVal = 0; // Discount starts at 0

          const calc = calcLine({
            methodType: method.type,
            width: widthStr ? parseFloat(widthStr) : null,
            height: heightStr ? parseFloat(heightStr) : null,
            quantity,
            rate: rateVal,
            discountPct: discountVal,
          });

          return {
            id: srv.id || `item-${sIdx + 1}-${iIdx + 1}`,
            productTitle: srv.signStyle || 'LED Channel Letters',
            materialName: srv.material || 'Acrylic Sheet',
            finishName: srv.finishing || 'Mirror Gold Finish',
            methodCode: defaultMethodCode,
            methodName: method.name,
            method: method.name,
            rateLabel: method.rate_label,
            size: widthStr && heightStr ? `${widthStr} × ${heightStr}` : widthStr || '',
            width: widthStr,
            height: heightStr,
            qty: quantity,
            quantity,
            price: null,
            rate: null,
            discount: 0,
            discountPct: 0,
            billableQty: calc.billableQty,
            total: calc.total,
            status: calc.status,
            reason: calc.reason,
          };
        })
        : site.services && site.services.length > 0
          ? site.services.map((svcName, iIdx) => {
            const defaultMethodCode: MethodCode = 'sq_ft';
            const method = METHOD_MAP[defaultMethodCode];
            const calc = calcLine({
              methodType: method.type,
              width: null,
              height: null,
              quantity: 1,
              rate: null,
              discountPct: 0,
            });

            return {
              id: `item-${sIdx + 1}-${iIdx + 1}`,
              productTitle: svcName,
              materialName: 'Acrylic Sheet',
              finishName: 'Mirror Gold Finish',
              methodCode: defaultMethodCode,
              methodName: method.name,
              method: method.name,
              rateLabel: method.rate_label,
              size: '',
              width: '',
              height: '',
              qty: 1,
              quantity: 1,
              price: null,
              rate: null,
              discount: 0,
              discountPct: 0,
              billableQty: null,
              total: null,
              status: calc.status,
              reason: calc.reason,
            };
          })
          : [
            {
              id: `item-${sIdx + 1}-1`,
              productTitle: 'Signage Service',
              materialName: 'Acrylic Sheet',
              finishName: 'Mirror Gold Finish',
              methodCode: 'sq_ft' as MethodCode,
              methodName: 'Square Feet',
              method: 'Square Feet',
              rateLabel: 'per sq ft',
              size: '',
              width: '',
              height: '',
              qty: 1,
              quantity: 1,
              price: null,
              rate: null,
              discount: 0,
              discountPct: 0,
              billableQty: null,
              total: null,
              status: 'incomplete',
              reason: 'size',
            },
          ],
  }));
}

interface LineFieldErrors {
  widthError: string | null;
  heightError: string | null;
  sizeError: string | null;
  rateError: string | null;
  hasErrors: boolean;
}

function getLineFieldErrors(item: QuoteLineItem): LineFieldErrors {
  const method = METHOD_MAP[item.methodCode] || METHOD_MAP.sq_ft;
  const wRaw = item.width !== undefined && item.width !== null ? String(item.width).trim() : '';
  const hRaw = item.height !== undefined && item.height !== null ? String(item.height).trim() : '';
  const wVal = wRaw !== '' ? parseFloat(wRaw) : NaN;
  const hVal = hRaw !== '' ? parseFloat(hRaw) : NaN;
  const rRaw = item.rate !== undefined && item.rate !== null ? String(item.rate).trim() : '';
  const rVal = rRaw !== '' ? parseFloat(rRaw) : NaN;

  let widthError: string | null = null;
  let heightError: string | null = null;
  let sizeError: string | null = null;

  if (method.type === 'area') {
    if (wRaw === '' || Number.isNaN(wVal) || wVal <= 0) {
      widthError = 'Enter width';
    }
    if (hRaw === '' || Number.isNaN(hVal) || hVal <= 0) {
      heightError = 'Enter height';
    }
    if (widthError && heightError) {
      sizeError = 'Enter width & height';
    } else {
      sizeError = widthError || heightError;
    }
  } else if (method.type === 'length') {
    if (wRaw === '' || Number.isNaN(wVal) || wVal <= 0) {
      widthError = 'Enter length';
      sizeError = 'Enter length';
    }
  }

  let rateError: string | null = null;
  if (rRaw === '' || Number.isNaN(rVal)) {
    rateError = 'Enter unit price';
  } else if (rVal < 0) {
    rateError = 'Must be 0 or more';
  }

  return {
    widthError,
    heightError,
    sizeError,
    rateError,
    hasErrors: Boolean(sizeError || rateError),
  };
}

export function QuotationView({
  customers,
  products,
  materials: _materials,
  finishes: _finishes,
  onOpenCustomerDrawer,
  showToast,
  initialCustomer,
  businessDetails,
  isSupplierEnabled = true,
  renegotiatingQuote,
  onClearRenegotiatingQuote,
}: QuotationViewProps) {
  // Mode: Customer vs Supplier
  const [quotationMode, setQuotationMode] = React.useState<string>('customer');

  React.useEffect(() => {
    if (!isSupplierEnabled && quotationMode === 'supplier') {
      setQuotationMode('customer');
    }
  }, [isSupplierEnabled, quotationMode]);

  // Customer State: Defaultly empty unless initialCustomer or renegotiatingQuote is provided
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerRecord | null>(
    renegotiatingQuote?.customer || initialCustomer || null
  );
  const [customerSearchQuery, setCustomerSearchQuery] = React.useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = React.useState(false);
  const searchDropdownRef = React.useRef<HTMLDivElement>(null);

  // Quote Metadata
  const [quoteNumber, setQuoteNumber] = React.useState(() => {
    if (renegotiatingQuote?.quoteNumber) return renegotiatingQuote.quoteNumber;
    try {
      const raw = localStorage.getItem('printpal_workshop_quotations');
      const list = raw ? JSON.parse(raw) : [];
      const nextNum = list.length + 1;
      return `Q-${String(nextNum).padStart(3, '0')}-V1`;
    } catch {
      return 'Q-001-V1';
    }
  });
  const [quoteVersionTitle, setQuoteVersionTitle] = React.useState<string | null>(
    renegotiatingQuote?.versionLabel || null
  );
  const [quoteDate] = React.useState(() => {
    return new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  });

  // Sites & Line Items: Only populated when a customer or renegotiation is chosen
  const [sites, setSites] = React.useState<QuoteSite[]>(() => {
    if (renegotiatingQuote && renegotiatingQuote.sites && renegotiatingQuote.sites.length > 0) {
      return JSON.parse(JSON.stringify(renegotiatingQuote.sites));
    }
    return initialCustomer ? mapCustomerSitesToQuoteSites(initialCustomer.sites || [], products) : [];
  });

  // Preview / PDF Modal State
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  // Field-level inline validation visibility (triggered on Create Customer Quote click)
  const [showValidationErrors, setShowValidationErrors] = React.useState(false);

  // Sync when renegotiatingQuote prop changes (Renegotiation / Version 2 auto-population)
  React.useEffect(() => {
    if (renegotiatingQuote) {
      setSelectedCustomer(renegotiatingQuote.customer);
      setQuoteNumber(renegotiatingQuote.quoteNumber);
      setQuoteVersionTitle(renegotiatingQuote.versionLabel);
      if (renegotiatingQuote.sites && renegotiatingQuote.sites.length > 0) {
        setSites(JSON.parse(JSON.stringify(renegotiatingQuote.sites)));
      }
      if (renegotiatingQuote.transportCost != null) setTransportCost(renegotiatingQuote.transportCost);
      if (renegotiatingQuote.designCharges != null) setDesignCharges(renegotiatingQuote.designCharges);
      if (renegotiatingQuote.installationCharges != null) setInstallationCharges(renegotiatingQuote.installationCharges);
      if (renegotiatingQuote.discountPercent != null) setDiscountPercent(renegotiatingQuote.discountPercent);
      if (renegotiatingQuote.gstRate != null) setGstRate(renegotiatingQuote.gstRate);
      if (renegotiatingQuote.fabNotes) setFabNotes(renegotiatingQuote.fabNotes);
      if (renegotiatingQuote.commercialTerms) setCommercialTerms(renegotiatingQuote.commercialTerms);
      setShowValidationErrors(false);
    }
  }, [renegotiatingQuote]);

  // Sync when initialCustomer prop changes (e.g. when Raise Quote is clicked in drawer)
  React.useEffect(() => {
    if (initialCustomer && !renegotiatingQuote) {
      setSelectedCustomer(initialCustomer);
      setSites(mapCustomerSitesToQuoteSites(initialCustomer.sites || [], products));
      setShowValidationErrors(false);
    }
  }, [initialCustomer, renegotiatingQuote, products]);

  // Auto-sync whenever customers prop updates (e.g. after customer drawer save)
  React.useEffect(() => {
    if (!selectedCustomer) return;
    const fresh = customers.find((c) => c.id === selectedCustomer.id);
    if (fresh) {
      setSelectedCustomer(fresh);
      if (fresh.sites && !renegotiatingQuote) {
        setSites(mapCustomerSitesToQuoteSites(fresh.sites, products));
      }
    }
  }, [customers, selectedCustomer?.id, products, renegotiatingQuote]);

  // Commercial Charges & Live Freight (default to 0 — no phantom charges)
  const [transportCost, setTransportCost] = React.useState<number>(renegotiatingQuote?.transportCost ?? 0);
  const [designCharges, setDesignCharges] = React.useState<number>(renegotiatingQuote?.designCharges ?? 0);
  const [installationCharges, setInstallationCharges] = React.useState<number>(renegotiatingQuote?.installationCharges ?? 0);
  const [discountPercent, setDiscountPercent] = React.useState<number>(renegotiatingQuote?.discountPercent ?? 0);
  const [gstRate, setGstRate] = React.useState<number>(renegotiatingQuote?.gstRate ?? 18);

  // Notes
  const [fabNotes, setFabNotes] = React.useState(renegotiatingQuote?.fabNotes || '');
  const [commercialTerms, setCommercialTerms] = React.useState(
    renegotiatingQuote?.commercialTerms || businessDetails?.defaultTerms?.trim() || ''
  );

  React.useEffect(() => {
    if (businessDetails?.defaultTerms?.trim()) {
      setCommercialTerms(businessDetails.defaultTerms.trim());
    }
  }, [businessDetails?.defaultTerms]);

  // Close search dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered customer list
  const filteredCustomers = React.useMemo(() => {
    const q = customerSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return customers.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
        (c.businessName && c.businessName.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [customers, customerSearchQuery]);

  // Handle selecting customer from dropdown
  const handleSelectCustomer = (cust: CustomerRecord) => {
    setSelectedCustomer(cust);
    setCustomerSearchQuery('');
    setIsSearchDropdownOpen(false);
    setSites(mapCustomerSitesToQuoteSites(cust.sites || [], products));
    setShowValidationErrors(false);
    showToast(`Loaded customer "${cust.name}" into quotation`, 'info');
  };

  // Toggle Site Accordion Expand/Collapse
  const toggleSiteAccordion = (siteId: string) => {
    setSites((prev) =>
      prev.map((site) =>
        site.id === siteId ? { ...site, isExpanded: !site.isExpanded } : site
      )
    );
  };

  // Delete Site
  const handleDeleteSite = (siteId: string) => {
    if (sites.length <= 1) {
      return;
    }
    setSites((prev) => prev.filter((s) => s.id !== siteId));
  };

  // Central Pure Line Item Recalculator
  const recomputeLine = (item: QuoteLineItem): QuoteLineItem => {
    const method = METHOD_MAP[item.methodCode] || METHOD_MAP.sq_ft;
    const w = item.width !== undefined && item.width !== null && String(item.width).trim() !== ''
      ? parseFloat(String(item.width))
      : null;
    const h = item.height !== undefined && item.height !== null && String(item.height).trim() !== ''
      ? parseFloat(String(item.height))
      : null;
    const rateVal = item.rate !== undefined && item.rate !== null && String(item.rate).trim() !== ''
      ? parseFloat(String(item.rate))
      : null;
    const qty = method.type === 'fixed' ? 1 : Math.max(1, parseInt(String(item.qty || item.quantity || 1)) || 1);
    const disc = Math.max(0, parseFloat(String(item.discount || 0)) || 0);

    const calc = calcLine({
      methodType: method.type,
      width: w,
      height: h,
      quantity: qty,
      rate: rateVal,
      discountPct: disc,
    });

    return {
      ...item,
      methodName: method.name,
      method: method.name,
      rateLabel: method.rate_label,
      qty,
      quantity: qty,
      rate: rateVal,
      price: rateVal,
      discount: disc,
      discountPct: disc,
      total: calc.total,
      status: calc.status,
      reason: calc.reason,
      billableQty: calc.billableQty,
    };
  };

  // Method Change Handler:
  // - Keeps typed width, height, quantity and discount.
  // - Clears ONLY rate (sets to empty).
  // - Moves focus to Rate input.
  // - For fixed, sets quantity to 1.
  const handleMethodChange = (siteId: string, itemId: string, newMethodCode: MethodCode) => {
    const newMethod = METHOD_MAP[newMethodCode] || METHOD_MAP.sq_ft;

    setSites((prev) =>
      prev.map((site) => {
        if (site.id !== siteId) return site;
        return {
          ...site,
          items: site.items.map((item) => {
            if (item.id !== itemId) return item;

            const newQty = newMethod.type === 'fixed' ? 1 : (item.quantity ?? item.qty ?? 1);
            const updated: QuoteLineItem = {
              ...item,
              methodCode: newMethodCode,
              qty: newQty,
              quantity: newQty,
              rate: null,
              price: null,
            };
            return recomputeLine(updated);
          }),
        };
      })
    );

    // Focus the rate input immediately
    setTimeout(() => {
      const el = document.getElementById(`rate-input-${itemId}`);
      if (el) el.focus();
    }, 50);

  };

  // Update Line Item Fields (qty, rate/price, discount)
  const handleUpdateLineItem = (
    siteId: string,
    itemId: string,
    field: 'qty' | 'rate' | 'discount',
    value: any
  ) => {
    setSites((prev) =>
      prev.map((site) => {
        if (site.id !== siteId) return site;
        return {
          ...site,
          items: site.items.map((item) => {
            if (item.id !== itemId) return item;
            const updated: QuoteLineItem = {
              ...item,
              [field]: value,
              ...(field === 'qty' ? { quantity: value } : {}),
              ...(field === 'rate' ? { price: value } : {}),
              ...(field === 'discount' ? { discountPct: value } : {}),
            };
            return recomputeLine(updated);
          }),
        };
      })
    );
  };

  // Update discrete dimension (Width or Height)
  const handleUpdateDimension = (
    siteId: string,
    itemId: string,
    dimension: 'width' | 'height',
    val: string
  ) => {
    setSites((prev) =>
      prev.map((site) => {
        if (site.id !== siteId) return site;
        return {
          ...site,
          items: site.items.map((item) => {
            if (item.id !== itemId) return item;
            const updated: QuoteLineItem = {
              ...item,
              [dimension]: val,
            };
            return recomputeLine(updated);
          }),
        };
      })
    );
  };

  // Delete Line Item
  const handleDeleteLineItem = (siteId: string, itemId: string) => {
    setSites((prev) =>
      prev.map((site) => {
        if (site.id !== siteId) return site;
        if (site.items.length <= 1) {
          return site;
        }
        return {
          ...site,
          items: site.items.filter((item) => item.id !== itemId),
        };
      })
    );
  };

  // Subtotal in summary sums ONLY complete lines
  const sitesSubtotal = React.useMemo(() => {
    if (!selectedCustomer) return 0;
    return sites.reduce((acc, site) => {
      const siteSum = site.items.reduce((sAcc, it) => {
        if (it.status === 'ok' && it.total !== null) {
          return sAcc + it.total;
        }
        return sAcc;
      }, 0);
      return acc + siteSum;
    }, 0);
  }, [selectedCustomer, sites]);

  const grossBeforeDiscount = selectedCustomer
    ? sitesSubtotal + Number(designCharges) + Number(installationCharges) + Number(transportCost)
    : 0;

  const discountAmount =
    selectedCustomer && discountPercent > 0
      ? Math.round((grossBeforeDiscount * discountPercent) / 100)
      : 0;

  const taxableTotal = Math.max(0, grossBeforeDiscount - discountAmount);
  const gstAmount = selectedCustomer ? Math.round((taxableTotal * gstRate) / 100) : 0;
  const grandTotal = selectedCustomer ? taxableTotal + gstAmount : 0;

  // Create Customer Quote handler (validates inline fields first, then dispatches to API)
  const handleCreateCustomerQuote = async () => {
    if (!selectedCustomer || sites.length === 0) return;

    const invalidSiteIds = new Set<string>();
    let firstInvalidInputId: string | null = null;

    for (const site of sites) {
      for (const item of site.items) {
        const errs = getLineFieldErrors(item);
        if (errs.hasErrors || item.status === 'incomplete' || item.total === null) {
          invalidSiteIds.add(site.id);
          if (!firstInvalidInputId) {
            const method = METHOD_MAP[item.methodCode] || METHOD_MAP.sq_ft;
            if (errs.widthError) {
              firstInvalidInputId =
                method.type === 'length' ? `length-input-${item.id}` : `width-input-${item.id}`;
            } else if (errs.heightError) {
              firstInvalidInputId = `height-input-${item.id}`;
            } else {
              firstInvalidInputId = `rate-input-${item.id}`;
            }
          }
        }
      }
    }

    if (invalidSiteIds.size > 0) {
      setShowValidationErrors(true);
      setSites((prev) =>
        prev.map((site) => (invalidSiteIds.has(site.id) ? { ...site, isExpanded: true } : site))
      );
      if (firstInvalidInputId) {
        const targetId = firstInvalidInputId;
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.focus();
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 60);
      }
      return;
    }

    setShowValidationErrors(false);

    const safeCustomerId = selectedCustomer.id || `cust-${Date.now()}`;
    const payload = {
      customerId: safeCustomerId,
      quoteNumber,
      quoteDate,
      action: 'create',
      subtotal: sitesSubtotal,
      transportCost,
      designCharges,
      installationCharges,
      discountPercent,
      gstRate,
      grandTotal,
      notesJson: { fabNotes, commercialTerms },
      sites: sites.map((s) => ({
        id: s.id,
        siteName: s.siteName,
        items: s.items.map((it) => ({
          id: it.id,
          product_title: it.productTitle,
          material_name: it.materialName,
          finish_name: it.finishName,
          method_code: it.methodCode,
          width: it.width,
          height: it.height,
          quantity: it.quantity ?? it.qty,
          rate: it.rate,
          discount_pct: it.discount,
        })),
      })),
    };

    const syncToLocalStorage = (finalId?: string) => {
      try {
        const newQuoteEntry = {
          id: finalId || `quote-${quoteNumber}`,
          quoteNumber,
          quoteDate,
          quoteStatus: 'Sent',
          customerId: safeCustomerId,
          createdAt: new Date().toISOString(),
          customerName: selectedCustomer.name,
          contactPerson: selectedCustomer.contactPerson || '',
          phone: selectedCustomer.phone || '',
          sitesCount: sites.length,
          grandTotal,
          discountPercent,
          gstRate,
          sitesSubtotal,
          designCharges,
          installationCharges,
          transportCost: Number(transportCost),
          discountAmount,
          taxableTotal,
          gstAmount,
          fabNotes,
          commercialTerms,
          sitesJson: sites,
        };
        const raw = localStorage.getItem('printpal_workshop_quotations');
        const list = raw ? JSON.parse(raw) : [];
        const updated = [newQuoteEntry, ...list.filter((q: any) => q.quoteNumber !== quoteNumber)];
        localStorage.setItem('printpal_workshop_quotations', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not sync quote to localStorage:', e);
      }
    };

    try {
      let res: Response | null = null;
      try {
        res = await fetch('/api/quotations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (networkErr) {
        console.warn('[QuotationView] Backend unreachable, proceeding with local creation:', networkErr);
      }

      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        onClearRenegotiatingQuote?.();
        syncToLocalStorage(data.quoteId || data.id);
        palNotch.workshop(
          `Quotation ${quoteNumber} Created`,
          `${selectedCustomer.name} • ₹${grandTotal.toLocaleString('en-IN')}`,
          { label: 'View PDF', onClick: () => setIsPreviewOpen(true) },
          'QUOTATION'
        );
        setIsPreviewOpen(true);
      } else {
        // Resilient Workshop Fallback: Always save locally and open preview so workshop operations never halt!
        onClearRenegotiatingQuote?.();
        syncToLocalStorage();
        palNotch.workshop(
          `Quotation ${quoteNumber} Created Locally`,
          `${selectedCustomer.name} • ₹${grandTotal.toLocaleString('en-IN')}`,
          { label: 'View PDF', onClick: () => setIsPreviewOpen(true) },
          'QUOTATION'
        );
        setIsPreviewOpen(true);

        if (!res) {
          showToast(`Quotation ${quoteNumber} saved locally (Offline mode). PDF ready.`, 'info');
        } else if (res.status === 401) {
          showToast(`Quotation saved locally. Sign in to sync quotes to cloud.`, 'info');
        } else {
          const err = await res.json().catch(() => ({}));
          const errMsg = err.error || err.message;
          if (errMsg) {
            showToast(`Saved locally. Cloud sync notice: ${errMsg}`, 'info');
          } else {
            showToast(`Quotation ${quoteNumber} created and saved locally`, 'info');
          }
        }
      }
    } catch (e) {
      console.error('[QuotationView] Unexpected quote creation failure:', e);
      onClearRenegotiatingQuote?.();
      syncToLocalStorage();
      palNotch.workshop(
        `Quotation ${quoteNumber} Saved Locally`,
        `${selectedCustomer.name} • ₹${grandTotal.toLocaleString('en-IN')}`,
        { label: 'View PDF', onClick: () => setIsPreviewOpen(true) },
        'QUOTATION'
      );
      setIsPreviewOpen(true);
      showToast(`Quotation saved locally`, 'info');
    }
  };

  return (
    <main className="printpal-content-body flex flex-col bg-[#F4F5F7] h-full flex-1 min-h-0 overflow-hidden">
      {/* ── 1. Top Bar: Customer Search & Quotation Type Segmented Control ── */}
      <section className="bg-white border-b border-[#DCE1E5] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 flex-shrink-0 relative z-20">
        {/* Left: Customer Label + Search Input + Add Customer Button */}
        <div className="flex items-center gap-3 relative" ref={searchDropdownRef}>
          <span className="text-[14px] font-semibold text-[#202428]">Customer</span>

          <div className="relative w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737B84]">
              <Search className="h-4 w-4" />
            </div>
            <Input
              type="text"
              placeholder="Customer name/number"
              value={customerSearchQuery}
              onChange={(e) => {
                setCustomerSearchQuery(e.target.value);
                setIsSearchDropdownOpen(true);
              }}
              onFocus={() => {
                if (customerSearchQuery.trim().length > 0) {
                  setIsSearchDropdownOpen(true);
                }
              }}
              className="pl-9 pr-8 text-[13px] h-9 bg-white border border-[#DCE1E5] rounded-md focus:border-[#2878D0]"
            />
            {customerSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setCustomerSearchQuery('');
                  setIsSearchDropdownOpen(false);
                }}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#737B84] hover:text-[#202428] cursor-pointer"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Dropdown Customer List (Only shows when user types name/number) */}
            {isSearchDropdownOpen && customerSearchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#DCE1E5] rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto printpal-compact-scroll py-1.5 divide-y divide-[#F1F5F9]">
                {filteredCustomers.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-[#737B84] text-center">
                    No customers found matching "{customerSearchQuery}"
                  </div>
                ) : (
                  filteredCustomers.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => handleSelectCustomer(cust)}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#F8FAFC] transition-colors flex flex-col gap-0.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-[#202428]">
                          {cust.name}
                        </span>
                        <span className="text-[11px] text-[#737B84] font-mono">
                          {cust.sites?.length || 0} sites
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#737B84]">
                        {cust.phone && <span>{cust.phone}</span>}
                        {cust.email && <span>• {cust.email}</span>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Add New Customer Button (Matching Raise Quote button in Customer Drawer) */}
          <Button
            type="button"
            variant="outline"
            id="btn-add-new-customer"
            onClick={() => {
              onOpenCustomerDrawer(false, undefined, 'New Customer');
            }}
            className="border-[#D7440E] text-[#D7440E] hover:bg-[#D7440E]/10 hover:text-[#D7440E] hover:border-[#D7440E] text-[13px] font-medium transition-colors shadow-none cursor-pointer h-9 px-4 rounded-md flex-shrink-0"
            title="Add a new customer in drawer"
          >
            Add New Customer
          </Button>
        </div>

        {/* Right: Segmented Control matching Customer | Enquiry | Supplier Tab (Hidden when Supplier module is off) */}
        {isSupplierEnabled && (
          <div className="flex items-center gap-3">
            <div className="printpal-segmented-toggle" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={quotationMode === 'customer'}
                className={`printpal-segment-btn ${quotationMode === 'customer' ? 'active' : ''}`}
                onClick={() => {
                  if (quotationMode !== 'customer') {
                    setQuotationMode('customer');
                  }
                }}
              >
                Customer Quotation
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={quotationMode === 'supplier'}
                className={`printpal-segment-btn ${quotationMode === 'supplier' ? 'active' : ''}`}
                onClick={() => {
                  if (quotationMode !== 'supplier') {
                    setQuotationMode('supplier');
                  }
                }}
              >
                Supplier Quotation
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── 2. Main Two-Column Quotation Workspace ── */}
      <div className="w-full flex-1 min-h-0 px-8 py-6 flex flex-col lg:flex-row gap-6 items-start overflow-hidden box-border">
        {/* Left Column: Scrollable Workspace (~68%) */}
        <div className="flex-1 w-full h-full min-h-0 overflow-y-auto printpal-compact-scroll pr-2 flex flex-col gap-5 min-w-0 pb-16">
          {!selectedCustomer ? (
            /* Empty State: Defaultly when no customer is searched/selected */
            <div className="w-full bg-white rounded-[14px] p-12 shadow-sm border-0 flex flex-col items-center justify-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-[#F3F5F7] flex items-center justify-center text-[#737B84] mb-4">
                <Search className="h-7 w-7 text-[#2878D0]" />
              </div>
              <h3 className="text-[17px] font-bold text-[#202428] mb-1.5">No Customer Selected</h3>
              <p className="text-[13px] text-[#737B84] max-w-md leading-relaxed">
                Search and select a customer above to view their details and create a quotation, or click Add New Customer beside the search bar to create a quotation for a new customer.
              </p>
            </div>
          ) : (
            <>
              {/* Card 1: Customer Details Card */}
              <div className="w-full bg-white rounded-[14px] p-6 shadow-sm border-0 flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-[#737B84] tracking-wider uppercase">
                      CUSTOMER DETAILS •
                    </span>
                    {quoteVersionTitle && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                        {quoteVersionTitle}
                      </span>
                    )}
                  </div>
                  <h2 className="text-[18px] font-bold text-[#202428] mb-2 leading-tight flex items-center gap-2.5">
                    <span>{selectedCustomer.name}</span>
                    {quoteVersionTitle && (
                      <span className="text-[14px] font-semibold text-[#1D4ED8]">
                        ({quoteVersionTitle})
                      </span>
                    )}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#737B84]">
                    {selectedCustomer.contactPerson && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-[#737B84]" />
                        <span>{selectedCustomer.contactPerson}</span>
                      </div>
                    )}
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-[#737B84]" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    )}
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-[#737B84]" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Metadata + Edit Button */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenCustomerDrawer(true, selectedCustomer, 'Edit Customer Details', {
                        section: 'basic',
                      })
                    }
                    className="flex items-center gap-1 text-[13px] text-[#2878D0] hover:text-[#2066b5] font-semibold cursor-pointer transition-colors"
                    title="Edit Customer Details in Drawer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>

                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#737B84] uppercase tracking-wider">
                        QUOTE NUMBER
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[13px] font-bold text-[#202428] font-mono">
                          {quoteNumber}
                        </span>
                        {quoteVersionTitle && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                            {quoteVersionTitle}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-7 w-[1px] bg-[#E2E8F0]" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#737B84] uppercase tracking-wider">
                        QUOTE DATE
                      </span>
                      <span className="text-[13px] font-semibold text-[#202428] mt-0.5">
                        {quoteDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2...N: Multi-Site Cards */}
              {sites.map((site, sIdx) => (
                <div
                  key={site.id}
                  className="w-full bg-white rounded-[14px] p-5 shadow-sm border-0 flex flex-col gap-4 transition-all"
                >
                  {/* Site Card Header: Inset Grey Bar (Matching Customer Drawer) */}
                  <div
                    className="w-full bg-[#F3F5F7] hover:bg-[#edf0f3] rounded-[8px] h-10 px-4 flex items-center justify-between mb-3 select-none cursor-pointer transition-colors"
                    onClick={() => toggleSiteAccordion(site.id)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[13px] font-semibold text-[#202428]">
                        {site.siteName || 'Site name'}
                      </span>
                      <BadgeGroup
                        variant="green"
                        label={`Site ${sIdx + 1}`}
                        counter={`${site.items.length} ${site.items.length === 1 ? 'service' : 'services'}`}
                      />
                    </div>

                    {/* Site Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCustomerDrawer(true, selectedCustomer, 'Edit Site & Services', {
                            section: 'site',
                            siteId: site.id,
                            siteIdx: sIdx,
                          });
                        }}
                        className="p-1.5 text-[#2878D0] hover:text-[#2066b5] hover:bg-white/60 rounded transition-colors cursor-pointer"
                        title="Edit Site & Services in Customer Drawer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          palNotch.confirm({
                            badge: "DELETE SITE",
                            title: `Delete Site "${site.siteName}"?`,
                            description: "This will permanently remove this entire site and all its configured product services.",
                            confirmText: "Delete Site",
                            cancelText: "Cancel",
                            variant: "destructive",
                            onConfirm: () => {
                              handleDeleteSite(site.id);
                              showToast(`Site "${site.siteName}" deleted successfully`, 'success');
                            },
                          });
                        }}
                        className="p-1.5 text-[#737B84] hover:text-[#EF4444] hover:bg-white/60 rounded transition-colors cursor-pointer"
                        title="Remove this site"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSiteAccordion(site.id);
                        }}
                        className="p-1.5 text-[#737B84] hover:text-[#202428] hover:bg-white/60 rounded transition-colors cursor-pointer"
                        title={site.isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {site.isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Site Body: Line Items Table */}
                  {site.isExpanded && (
                    <div className="flex flex-col px-1.5 py-1">
                      {/* Table Column Headers */}
                      <div className="grid grid-cols-[minmax(210px,2.4fr)_minmax(140px,1.3fr)_minmax(110px,1.2fr)_minmax(65px,0.7fr)_minmax(115px,1.3fr)_minmax(85px,0.9fr)_minmax(115px,1.3fr)_minmax(70px,0.8fr)] gap-3.5 text-[12px] font-semibold text-[#737B84] pb-2.5 border-b border-[#F1F5F9] mb-4 select-none">
                        <div className="text-left pl-0.5">Product</div>
                        <div className="text-left">Method</div>
                        <div className="text-center">Size</div>
                        <div className="text-center">Qty</div>
                        <div className="text-center">Price</div>
                        <div className="text-center">Discount</div>
                        <div className="text-right pr-2">Total</div>
                        <div className="text-center">Action</div>
                      </div>

                      {/* Line Items */}
                      <div className="flex flex-col gap-3.5">
                        {site.items.map((item, iIdx) => {
                          const method = METHOD_MAP[item.methodCode] || METHOD_MAP.sq_ft;

                          return (
                            <div
                              key={item.id}
                              className="grid grid-cols-[minmax(210px,2.4fr)_minmax(140px,1.3fr)_minmax(110px,1.2fr)_minmax(65px,0.7fr)_minmax(115px,1.3fr)_minmax(85px,0.9fr)_minmax(115px,1.3fr)_minmax(70px,0.8fr)] gap-3.5 items-start text-[13px] py-2.5 border-b border-[#F8FAFC] last:border-b-0"
                            >
                              {/* 1. Product Title & Material & Finish in 3 distinct stacked lines */}
                              <div className="flex flex-col pr-1 min-w-0 pt-1.5">
                                <div
                                  className="text-[13px] font-semibold text-[#202428] leading-tight"
                                  title={item.productTitle}
                                >
                                  {item.productTitle}
                                </div>
                                <div
                                  className="text-[11px] text-[#737B84] leading-tight mt-1"
                                  title={item.materialName || 'Acrylic Sheet'}
                                >
                                  {item.materialName || 'Acrylic Sheet'}
                                </div>
                                <div
                                  className="text-[11px] text-[#737B84] leading-tight mt-0.5"
                                  title={item.finishName || 'Mirror Gold Finish'}
                                >
                                  {item.finishName || 'Mirror Gold Finish'}
                                </div>
                              </div>

                              {/* 2. Method Dropdown: Lists the six locked methods by name in sort_order */}
                              <div className="w-full">
                                <Select
                                  value={item.methodCode}
                                  onValueChange={(val) =>
                                    handleMethodChange(site.id, item.id, val as MethodCode)
                                  }
                                >
                                  <SelectTrigger className="w-full h-10 bg-white border-[#DCE1E5] text-[13px] font-medium text-[#202428] rounded-md hover:border-[#b5bfc7] focus:border-[#2878D0] focus:ring-0 focus-visible:ring-1 focus-visible:ring-[#2878D0] data-[state=open]:border-[#2878D0] shadow-none">
                                    <SelectValue placeholder="Method">
                                      {method.name}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border-[#DCE1E5] shadow-lg rounded-md z-[9999]">
                                    <SelectItem value="sq_ft">Square Feet</SelectItem>
                                    <SelectItem value="run_ft">Running Feet</SelectItem>
                                    <SelectItem value="sq_m">Square Metre</SelectItem>
                                    <SelectItem value="run_m">Running Metre</SelectItem>
                                    <SelectItem value="per_piece">Per Piece</SelectItem>
                                    <SelectItem value="lump_sum">Lump Sum</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="min-h-[16px] mt-1" />
                              </div>

                              {/* 3. Dimension Control per Method Type */}
                              <div className="flex flex-col justify-start">
                                {(() => {
                                  const sizeErrors = showValidationErrors ? getLineFieldErrors(item) : null;
                                  const hasSizeError = Boolean(sizeErrors?.sizeError);
                                  if (method.type === 'area') {
                                    return (
                                      <div className="flex flex-col">
                                        <div
                                          className={`flex items-center h-10 bg-white border rounded-md px-2 transition-colors ${
                                            hasSizeError
                                              ? 'border-red-500 hover:border-red-600 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500'
                                              : 'border-[#DCE1E5] hover:border-[#b5bfc7] focus-within:border-[#2878D0] focus-within:ring-1 focus-within:ring-[#2878D0]'
                                          }`}
                                        >
                                          <input
                                            id={`width-input-${item.id}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="W"
                                            aria-invalid={Boolean(sizeErrors?.widthError)}
                                            value={item.width !== undefined && item.width !== null ? String(item.width) : ''}
                                            onChange={(e) =>
                                              handleUpdateDimension(site.id, item.id, 'width', e.target.value)
                                            }
                                            className={`w-full text-center text-[13px] font-semibold text-[#202428] bg-transparent outline-none placeholder:font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none no-spin-arrows ${
                                              sizeErrors?.widthError ? 'placeholder:text-red-400' : 'placeholder:text-[#94A3B8]'
                                            }`}
                                          />
                                          <span className="text-[12px] font-bold text-[#737B84] px-1 select-none pointer-events-none">
                                            ×
                                          </span>
                                          <input
                                            id={`height-input-${item.id}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="H"
                                            aria-invalid={Boolean(sizeErrors?.heightError)}
                                            value={item.height !== undefined && item.height !== null ? String(item.height) : ''}
                                            onChange={(e) =>
                                              handleUpdateDimension(site.id, item.id, 'height', e.target.value)
                                            }
                                            className={`w-full text-center text-[13px] font-semibold text-[#202428] bg-transparent outline-none placeholder:font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none no-spin-arrows ${
                                              sizeErrors?.heightError ? 'placeholder:text-red-400' : 'placeholder:text-[#94A3B8]'
                                            }`}
                                          />
                                          <span className="text-[11px] font-semibold text-[#737B84] pl-1 pr-0.5 select-none pointer-events-none">
                                            {method.size_unit}
                                          </span>
                                        </div>
                                        {/* Inline error or calculated area text beneath */}
                                        <div className="min-h-[16px] flex items-center justify-center mt-1">
                                          {hasSizeError ? (
                                            <span
                                              role="alert"
                                              className="printpal-error-text flex items-center gap-1 text-[11px] font-medium text-red-500 leading-tight"
                                            >
                                              <AlertCircle className="h-3 w-3 shrink-0" />
                                              <span>{sizeErrors?.sizeError}</span>
                                            </span>
                                          ) : (
                                            (() => {
                                              const w = parseFloat(String(item.width || ''));
                                              const h = parseFloat(String(item.height || ''));
                                              if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
                                                const area = w * h;
                                                const areaDisplay = Number.isInteger(area) ? area : parseFloat(area.toFixed(2));
                                                const unitLabel = method.code === 'sq_m' ? 'sq m' : 'sq ft';
                                                return (
                                                  <span className="text-[10px] text-[#737B84] font-mono select-none">
                                                    {areaDisplay} {unitLabel}
                                                  </span>
                                                );
                                              }
                                              return null;
                                            })()
                                          )}
                                        </div>
                                      </div>
                                    );
                                  }
                                  if (method.type === 'length') {
                                    return (
                                      <div className="flex flex-col">
                                        <div
                                          className={`flex items-center h-10 bg-white border rounded-md px-2 transition-colors ${
                                            hasSizeError
                                              ? 'border-red-500 hover:border-red-600 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500'
                                              : 'border-[#DCE1E5] hover:border-[#b5bfc7] focus-within:border-[#2878D0] focus-within:ring-1 focus-within:ring-[#2878D0]'
                                          }`}
                                        >
                                          <input
                                            id={`length-input-${item.id}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="L"
                                            aria-invalid={hasSizeError}
                                            value={item.width !== undefined && item.width !== null ? String(item.width) : ''}
                                            onChange={(e) =>
                                              handleUpdateDimension(site.id, item.id, 'width', e.target.value)
                                            }
                                            className={`w-full text-center text-[13px] font-semibold text-[#202428] bg-transparent outline-none placeholder:font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none no-spin-arrows ${
                                              hasSizeError ? 'placeholder:text-red-400' : 'placeholder:text-[#94A3B8]'
                                            }`}
                                          />
                                          <span className="text-[11px] font-semibold text-[#737B84] pl-1 pr-0.5 select-none pointer-events-none">
                                            {method.size_unit}
                                          </span>
                                        </div>
                                        <div className="min-h-[16px] flex items-center justify-center mt-1">
                                          {hasSizeError && (
                                            <span
                                              role="alert"
                                              className="printpal-error-text flex items-center gap-1 text-[11px] font-medium text-red-500 leading-tight"
                                            >
                                              <AlertCircle className="h-3 w-3 shrink-0" />
                                              <span>{sizeErrors?.sizeError}</span>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="flex flex-col">
                                      <div className="flex items-center justify-center h-10 text-[14px] font-bold text-[#94A3B8] select-none">
                                        —
                                      </div>
                                      <div className="min-h-[16px] mt-1" />
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* 4. Qty input: locked to 1 for fixed; editable stepper for others */}
                              <div className="flex flex-col justify-start">
                                <Input
                                  type="number"
                                  min={1}
                                  step={1}
                                  disabled={method.type === 'fixed'}
                                  value={method.type === 'fixed' ? 1 : (item.quantity ?? item.qty ?? 1)}
                                  onChange={(e) =>
                                    handleUpdateLineItem(
                                      site.id,
                                      item.id,
                                      'qty',
                                      Math.max(1, parseInt(e.target.value) || 1)
                                    )
                                  }
                                  className={`h-10 text-[13px] text-center font-semibold bg-white border-[#DCE1E5] rounded-md transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none no-spin-arrows ${method.type === 'fixed'
                                    ? 'bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed'
                                    : 'hover:border-[#b5bfc7] focus:border-[#2878D0]'
                                    }`}
                                />
                                <div className="min-h-[16px] mt-1" />
                              </div>

                              {/* 5. Price / Rate input with embedded ₹ and inline validation or rate_label beneath */}
                              {(() => {
                                const rateError = showValidationErrors ? getLineFieldErrors(item).rateError : null;
                                const hasRateError = Boolean(rateError);
                                return (
                                  <div className="flex flex-col justify-start">
                                    <div className="relative flex items-center">
                                      <span className="absolute left-2.5 text-[13px] font-semibold text-[#737B84] pointer-events-none select-none">
                                        ₹
                                      </span>
                                      <Input
                                        id={`rate-input-${item.id}`}
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        placeholder="0.00"
                                        aria-invalid={hasRateError}
                                        value={
                                          item.rate !== undefined && item.rate !== null
                                            ? String(item.rate)
                                            : item.price !== undefined && item.price !== null
                                              ? String(item.price)
                                              : ''
                                        }
                                        onChange={(e) =>
                                          handleUpdateLineItem(
                                            site.id,
                                            item.id,
                                            'rate',
                                            e.target.value === '' ? null : parseFloat(e.target.value)
                                          )
                                        }
                                        className={`h-10 pl-6 pr-2.5 text-[13px] text-right font-semibold bg-white rounded-md transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none no-spin-arrows ${
                                          hasRateError
                                            ? '!border-red-500 hover:!border-red-600 focus:!border-red-500 focus-visible:!ring-1 focus-visible:!ring-red-500'
                                            : 'border-[#DCE1E5] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0]'
                                        }`}
                                      />
                                    </div>
                                    <div className="min-h-[16px] flex items-center justify-center mt-1">
                                      {hasRateError ? (
                                        <span
                                          role="alert"
                                          className="printpal-error-text flex items-center gap-1 text-[11px] font-medium text-red-500 leading-tight"
                                        >
                                          <AlertCircle className="h-3 w-3 shrink-0" />
                                          <span>{rateError}</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-[#737B84] text-center font-medium select-none truncate">
                                          {method.rate_label}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* 6. Discount input with % suffix */}
                              <div className="flex flex-col justify-start">
                                <div className="relative flex items-center">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    placeholder="0"
                                    value={
                                      item.discount !== undefined && item.discount !== null
                                        ? String(item.discount)
                                        : '0'
                                    }
                                    onChange={(e) =>
                                      handleUpdateLineItem(
                                        site.id,
                                        item.id,
                                        'discount',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="h-10 pl-2 pr-5 text-[13px] text-center font-semibold bg-white border-[#DCE1E5] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0] rounded-md transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none no-spin-arrows"
                                  />
                                  <span className="absolute right-2.5 text-[12px] font-semibold text-[#737B84] pointer-events-none select-none">
                                    %
                                  </span>
                                </div>
                                <div className="min-h-[16px] mt-1" />
                              </div>

                              {/* 7. Total: Formatted rupee or grey dash */}
                              <div className="flex flex-col justify-start">
                                {item.status === 'ok' && item.total !== null ? (
                                  <div
                                    className="w-full h-10 px-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md flex items-center justify-end font-bold text-[#202428] text-[13px] font-mono select-none"
                                    title={`Total for ${item.productTitle}`}
                                  >
                                    ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                ) : (
                                  <div className="w-full h-10 flex items-center justify-end font-bold text-[#94A3B8] text-[13px] select-none pr-2">
                                    —
                                  </div>
                                )}
                                <div className="min-h-[16px] mt-1" />
                              </div>

                              {/* 8. Actions (Edit in Drawer & Delete with Confirmation) */}
                              <div className="flex flex-col justify-start">
                                <div className="h-10 flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onOpenCustomerDrawer(
                                        true,
                                        selectedCustomer,
                                        'Edit Service Specifications',
                                        {
                                          section: 'service',
                                          siteId: site.id,
                                          siteIdx: sIdx,
                                          serviceId: item.id,
                                          serviceIdx: iIdx,
                                        }
                                      )
                                    }
                                    className="p-1.5 text-[#2878D0] hover:text-[#2066b5] hover:bg-[#F3F5F7] rounded transition-colors cursor-pointer"
                                    title="Edit in customer drawer"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      palNotch.confirm({
                                        badge: "DELETE ITEM",
                                        title: `Delete "${item.productTitle}"?`,
                                        description: `Remove this item from ${site.siteName}? This action cannot be undone.`,
                                        confirmText: "Delete Item",
                                        cancelText: "Cancel",
                                        variant: "destructive",
                                        onConfirm: () => {
                                          handleDeleteLineItem(site.id, item.id);
                                          showToast(`Item "${item.productTitle}" deleted successfully`, 'success');
                                        },
                                      });
                                    }}
                                    className="p-1.5 text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors cursor-pointer"
                                    title="Delete line item"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="min-h-[16px] mt-1" />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Another Service in this Site */}
                      <div className="pt-3 mt-2 border-t border-[#F1F5F9]">
                        <button
                          type="button"
                          onClick={() => {
                            onOpenCustomerDrawer(
                              true,
                              selectedCustomer,
                              'Add Service to Site',
                              {
                                section: 'add-service',
                                siteId: site.id,
                                siteIdx: sIdx,
                              }
                            );
                          }}
                          className="inline-flex items-center gap-1.5 text-[13px] text-[#2878D0] hover:text-[#2066b5] font-semibold cursor-pointer transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Add another service</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Another Site Button (Matching Customer Drawer: Outline Secondary Box, no plus icon) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onOpenCustomerDrawer(true, selectedCustomer, 'Add Site to Customer', {
                      section: 'add-site',
                    });
                  }}
                  className="h-9 px-4 text-[13px] font-medium text-[#2878D0] bg-[#EDF5FD] hover:bg-[#E1EFFD] border border-[#2878D0] rounded-md shadow-xs transition-colors cursor-pointer select-none inline-flex items-center justify-center"
                >
                  Add Another Site
                </button>
              </div>

              {/* Notes Card */}
              <div className="w-full bg-white rounded-[14px] p-6 shadow-sm border-0 flex flex-col gap-4">
                <h3 className="text-[14px] font-bold text-[#202428]">Notes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fab Notes */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#737B84]">
                      Fabrication & Installation Notes
                    </label>
                    <Textarea
                      rows={4}
                      value={fabNotes}
                      placeholder="e.g. Scaffolding setup required at facade, electrical line hookup by customer up to 2m from sign point..."
                      onChange={(e) => setFabNotes(e.target.value)}
                      className="text-[12px] text-[#475569] leading-relaxed bg-[#F8FAFC] border-[#E2E8F0] rounded-xl p-3 resize-none focus:bg-white focus:border-[#2878D0]"
                    />
                  </div>

                  {/* Commercial Terms */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#737B84]">
                      Commercial Terms & Conditions
                    </label>
                    <Textarea
                      rows={4}
                      value={commercialTerms}
                      placeholder="e.g. 50% advance with Purchase Order, balance on handover..."
                      onChange={(e) => setCommercialTerms(e.target.value)}
                      className="text-[12px] text-[#475569] leading-relaxed bg-[#F8FAFC] border-[#E2E8F0] rounded-xl p-3 resize-none focus:bg-white focus:border-[#2878D0]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Quote Summary Card (~32%) */}
        <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-[14px] p-6 shadow-sm border-0 flex flex-col gap-5 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="text-[16px] font-bold text-[#202428]">Quote Summary</h3>
            </div>

            <div className="flex flex-col gap-3.5 text-[13px]">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-[#737B84]">
                  Subtotal ({sites.length} {sites.length === 1 ? 'Site' : 'Sites'})
                </span>
                <span className="font-bold text-[#202428] font-mono">
                  ₹{sitesSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Design Charges (rendered only when configured > 0) */}
              {designCharges > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#737B84]">
                    <span>Design & 3D Visualizer</span>
                    <Info className="h-3.5 w-3.5 text-[#94A3B8]" />
                  </div>
                  <span className="font-semibold text-[#202428] font-mono">
                    ₹{designCharges.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Installation Charges (rendered only when configured > 0) */}
              {installationCharges > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#737B84]">
                    <span>Installation Charges</span>
                    <Info className="h-3.5 w-3.5 text-[#94A3B8]" />
                  </div>
                  <span className="font-semibold text-[#202428] font-mono">
                    ₹{installationCharges.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Transport & Freight (rendered only when configured > 0) */}
              {transportCost > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[#737B84]">Transport & Freight</span>
                  <span className="font-semibold text-[#202428] font-mono">
                    ₹{Number(transportCost).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Discount */}
              {discountPercent > 0 && (
                <div className="flex items-center justify-between text-[#1E7E34]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#737B84]">Discount</span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[#EBF5EE] text-[#1E7E34]">
                      -{discountPercent}%
                    </span>
                  </div>
                  <span className="font-bold font-mono">
                    - ₹{discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* GST */}
              <div className="flex flex-col gap-1 pt-2 border-t border-[#F1F5F9]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#202428]">GST ({gstRate}%)</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextRate = gstRate === 18 ? 12 : 18;
                        setGstRate(nextRate);
                        showToast(
                          `GST slab updated to ${nextRate}% (CGST ${(nextRate / 2).toFixed(1)}% + SGST ${(nextRate / 2).toFixed(1)}%)`,
                          'info'
                        );
                      }}
                      className="text-[11px] text-[#2878D0] hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <span className="font-bold text-[#202428] font-mono">
                    ₹{gstAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[11px] text-[#737B84]">
                  CGST {(gstRate / 2).toFixed(1)}% + SGST {(gstRate / 2).toFixed(1)}%
                </span>
              </div>

              <div className="h-[1px] bg-[#E2E8F0] my-1" />

              {/* Grand Total */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-bold text-[#202428] tracking-wide uppercase">
                    GRAND TOTAL
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[22px] font-extrabold text-[#202428]">
                      ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] font-semibold text-[#737B84]">INR</span>
                  </div>
                </div>
                <span className="text-[11px] text-[#737B84]">All taxes & freight included</span>
              </div>

              {/* Primary Action Button (triggers inline validation if any line fields are missing) */}
              <div>
                <Button
                  type="button"
                  variant="orange"
                  disabled={!selectedCustomer || sites.length === 0}
                  onClick={handleCreateCustomerQuote}
                  className={`w-full mt-3 h-11 text-[14px] font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 ${!selectedCustomer || sites.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                >
                  <span>
                    {selectedCustomer
                      ? quoteVersionTitle
                        ? `Create Customer Quote (${quoteVersionTitle})`
                        : 'Create Customer Quote'
                      : 'Select Customer to Create Quote'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PDF Preview (full-screen overlay, Section 6) ── */}
      {isPreviewOpen && selectedCustomer && (
        <QuotePDFPreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          customer={selectedCustomer}
          sites={sites}
          quoteNumber={quoteNumber}
          quoteDate={quoteDate}
          sitesSubtotal={sitesSubtotal}
          designCharges={designCharges}
          installationCharges={installationCharges}
          transportCost={transportCost}
          discountPercent={discountPercent}
          discountAmount={discountAmount}
          taxableTotal={taxableTotal}
          gstRate={gstRate}
          gstAmount={gstAmount}
          grandTotal={grandTotal}
          fabNotes={fabNotes}
          commercialTerms={commercialTerms}
          businessDetails={businessDetails}
        />
      )}
    </main>
  );
}
