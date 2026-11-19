/**
 * Industry-standard Zod + Regulatory Validation for Business Details Form
 */

import { z } from "zod";
import type { BusinessDetailsRecord } from "./businessDetails.types";

// Indian 10-digit mobile / phone format (supports +91, 0, hyphens, spaces) or international E.164
const indianPhoneRegex = /^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6789]\d{9}$/;
const intlPhoneRegex = /^\+?[1-9]\d{6,14}$/;

// Indian GSTIN: 15 alphanumeric characters (2-digit state + 10-char PAN + entity + Z + checksum)
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// Indian PAN: 5 letters + 4 digits + 1 letter
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Indian Pincode: 6 digits, non-zero start
const indiaPincodeRegex = /^[1-9][0-9]{5}$/;

// International Postal Code
const generalPostalRegex = /^[A-Za-z0-9\s-]{3,12}$/;

export interface BusinessDetailsValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof BusinessDetailsRecord, string>>;
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidWebsiteUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  if (/\s/.test(trimmed)) return false;
  const candidate = normalizeUrl(trimmed);
  try {
    const parsed = new URL(candidate);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      parsed.hostname.includes(".") &&
      parsed.hostname.split(".").pop()!.length >= 2
    );
  } catch {
    return false;
  }
}

export function validateBusinessDetails(
  data: BusinessDetailsRecord
): BusinessDetailsValidationResult {
  const errors: Partial<Record<keyof BusinessDetailsRecord, string>> = {};

  // Legal / Display Name (required)
  const legalName = data.legalName?.trim() || "";
  if (!legalName) {
    errors.legalName = "Legal / Display Name is required";
  } else if (legalName.length < 2) {
    errors.legalName = "Legal / Display Name must be at least 2 characters";
  }

  // Registered Address fields
  if (!data.addressLine1?.trim()) {
    errors.addressLine1 = "Address Line 1 is required";
  }
  if (!data.city?.trim()) {
    errors.city = "City is required";
  }
  if (!data.state?.trim()) {
    errors.state = "State is required";
  }
  const country = data.country?.trim() || "";
  if (!country) {
    errors.country = "Country is required";
  }

  const pincode = data.pincode?.trim() || "";
  if (!pincode) {
    errors.pincode = "Pincode is required";
  } else if (country.toLowerCase() === "india") {
    if (!indiaPincodeRegex.test(pincode)) {
      errors.pincode = "Enter a valid 6-digit Indian pincode (e.g. 600001)";
    }
  } else if (!generalPostalRegex.test(pincode)) {
    errors.pincode = "Enter a valid postal / ZIP code";
  }

  // GSTIN (optional, validated if provided)
  const gstin = data.gstin?.trim().toUpperCase() || "";
  if (gstin && !gstinRegex.test(gstin)) {
    errors.gstin = "Invalid 15-character GSTIN (e.g. 33AAAAA0000A1Z5)";
  }

  // PAN (optional, validated if provided)
  const pan = data.pan?.trim().toUpperCase() || "";
  if (pan && !panRegex.test(pan)) {
    errors.pan = "Invalid 10-character PAN format (e.g. ABCDE1234F)";
  }

  // Cross-check PAN inside GSTIN if both are provided
  if (gstin && gstinRegex.test(gstin) && pan && panRegex.test(pan)) {
    const panFromGstin = gstin.slice(2, 12);
    if (panFromGstin !== pan) {
      errors.pan = `PAN should match characters 3–12 of your GSTIN (${panFromGstin})`;
    }
  }

  // Phone (required, industry-standard mobile/landline validation)
  const phone = data.phone?.trim() || "";
  const compactPhone = phone.replace(/[\s\-()]/g, "");
  if (!phone) {
    errors.phone = "Business phone number is required";
  } else if (country.toLowerCase() === "india") {
    if (!indianPhoneRegex.test(phone) && !intlPhoneRegex.test(compactPhone)) {
      errors.phone = "Enter a valid 10-digit phone number (e.g. +91 98401 23456)";
    }
  } else if (!intlPhoneRegex.test(compactPhone)) {
    errors.phone = "Enter a valid international phone number";
  }

  // Email (required, Zod RFC validation)
  const email = data.email?.trim() || "";
  if (!email) {
    errors.email = "Business email address is required";
  } else if (!z.string().email().safeParse(email).success) {
    errors.email = "Enter a valid email address (e.g. billing@company.com)";
  }

  // Website URL (optional, strict URL validation when entered)
  const website = data.website?.trim() || "";
  if (website && !isValidWebsiteUrl(website)) {
    errors.website = "Enter a valid website URL (e.g. https://printpal.in)";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

