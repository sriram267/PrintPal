import { z } from "zod";

// Phone validation: Indian 10-digit mobile number format
const phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6789]\d{9}$/;

// GSTIN validation: 15 alphanumeric characters standard Indian GST
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// Indian Pincode: 6 digits, non-zero first digit
const pincodeRegex = /^[1-9][0-9]{5}$/;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstErrorTab?: "services" | "billing";
}

export function validateCustomerForm(
  basicDetails: {
    businessName: string;
    primaryContactName: string;
    primaryContactNumber: string;
    isWhatsAppSame: boolean;
    whatsappNumber: string;
    email: string;
    followUpDate?: string;
  },
  sites: Array<{
    siteName?: string;
    address?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    contactPerson?: string;
    contactPhone?: string;
    serviceDetails?: Array<{
      width?: string;
      height?: string;
      quantity?: number;
    }>;
  }>,
  billingDetails: {
    gstin?: string;
    billingAddress?: string;
  }
): ValidationResult {
  const errors: Record<string, string> = {};
  let firstErrorTab: "services" | "billing" | undefined = undefined;

  // 1. Basic Details Validation
  const hasBizName = basicDetails.businessName?.trim().length > 0;
  const hasContactName = basicDetails.primaryContactName?.trim().length > 0;

  if (!hasBizName && !hasContactName) {
    errors.businessName = "Enter business name, or provide a contact person below";
    errors.primaryContactName = "Enter contact person, or provide a business name above";
  }

  const rawPhone = basicDetails.primaryContactNumber?.replace(/[\s-+]/g, "");
  if (!basicDetails.primaryContactNumber?.trim()) {
    errors.primaryContactNumber = "Enter a 10-digit mobile number";
  } else if (!phoneRegex.test(basicDetails.primaryContactNumber.trim()) && (!rawPhone || rawPhone.length < 10)) {
    errors.primaryContactNumber = "Enter a valid 10-digit mobile number (e.g. 98401 23456)";
  }

  if (!basicDetails.isWhatsAppSame) {
    const rawWa = basicDetails.whatsappNumber?.replace(/[\s-+]/g, "");
    if (!basicDetails.whatsappNumber?.trim()) {
      errors.whatsappNumber = "Enter a 10-digit WhatsApp number for sending estimates";
    } else if (!phoneRegex.test(basicDetails.whatsappNumber.trim()) && (!rawWa || rawWa.length < 10)) {
      errors.whatsappNumber = "Enter a valid 10-digit mobile number for WhatsApp";
    }
  }

  if (basicDetails.email?.trim()) {
    const emailResult = z.string().email().safeParse(basicDetails.email.trim());
    if (!emailResult.success) {
      errors.email = "Enter a valid email address (e.g. name@company.com)";
    }
  }

  // 2. Billing Details Validation
  if (billingDetails.gstin?.trim()) {
    const cleanGst = billingDetails.gstin.trim().toUpperCase();
    if (!gstinRegex.test(cleanGst)) {
      errors.gstin = "Enter a valid 15-character GSTIN (e.g. 33AAAAA0000A1Z5)";
      if (!firstErrorTab) firstErrorTab = "billing";
    }
  }

  // 3. Sites & Services Validation
  if (!sites || sites.length === 0) {
    errors.sites = "At least one installation site is required";
    if (!firstErrorTab) firstErrorTab = "services";
  } else {
    sites.forEach((site, sIdx) => {
      const hasAddr = Boolean(site.address?.trim() || site.addressLine1?.trim());
      if (!hasAddr) {
        errors[`site_${sIdx}_address`] = "Enter site location or delivery address";
        if (!firstErrorTab) firstErrorTab = "services";
      }

      if (site.pincode?.trim()) {
        if (!pincodeRegex.test(site.pincode.trim())) {
          errors[`site_${sIdx}_pincode`] = "Enter a valid 6-digit postal pincode";
          if (!firstErrorTab) firstErrorTab = "services";
        }
      }

      if (site.contactPhone?.trim()) {
        const rawSitePhone = site.contactPhone.replace(/[\s-+]/g, "");
        if (!phoneRegex.test(site.contactPhone.trim()) && (!rawSitePhone || rawSitePhone.length < 10)) {
          errors[`site_${sIdx}_contact_phone`] = "Enter a valid 10-digit on-site contact number";
          if (!firstErrorTab) firstErrorTab = "services";
        }
      }

      // Check service dimensions
      (site.serviceDetails || []).forEach((srv, srvIdx) => {
        if (srv.width && isNaN(Number(srv.width))) {
          errors[`site_${sIdx}_srv_${srvIdx}_width`] = "Enter width as a numeric value";
          if (!firstErrorTab) firstErrorTab = "services";
        }
        if (srv.height && isNaN(Number(srv.height))) {
          errors[`site_${sIdx}_srv_${srvIdx}_height`] = "Enter height as a numeric value";
          if (!firstErrorTab) firstErrorTab = "services";
        }
        if (srv.quantity !== undefined && srv.quantity < 1) {
          errors[`site_${sIdx}_srv_${srvIdx}_qty`] = "Quantity must be 1 or more";
          if (!firstErrorTab) firstErrorTab = "services";
        }
      });
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstErrorTab,
  };
}

export function validateEnquiryForm(data: {
  contactName: string;
  phone: string;
  email?: string;
  inquiryNote: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.contactName?.trim()) {
    errors.contactName = "Enter contact person or business name";
  }

  const rawPhone = data.phone?.replace(/[\s-+]/g, "");
  if (!data.phone?.trim()) {
    errors.phone = "Enter a 10-digit mobile number";
  } else if (!phoneRegex.test(data.phone.trim()) && (!rawPhone || rawPhone.length < 10)) {
    errors.phone = "Enter a valid 10-digit mobile number (e.g. 98401 23456)";
  }

  if (data.email?.trim()) {
    const emailResult = z.string().email().safeParse(data.email.trim());
    if (!emailResult.success) {
      errors.email = "Enter a valid email address (e.g. name@company.com)";
    }
  }

  if (!data.inquiryNote?.trim()) {
    errors.inquiryNote = "Enter signage specifications or enquiry requirements";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

