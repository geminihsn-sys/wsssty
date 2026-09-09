/**
 * Input validation helpers. The phone rules target Algerian mobile numbers.
 */

/** Strip spaces/dashes/dots and normalize +213 / 00213 prefixes to a leading 0. */
export function normalizePhone(raw: string): string {
  let p = (raw || "").replace(/[\s.\-()]/g, "");
  if (p.startsWith("+213")) p = "0" + p.slice(4);
  else if (p.startsWith("00213")) p = "0" + p.slice(5);
  else if (p.startsWith("213") && p.length === 12) p = "0" + p.slice(3);
  return p;
}

/**
 * Algerian mobile format: 10 digits starting 05, 06 or 07
 * (Mobilis / Djezzy / Ooredoo). Landlines are not accepted for delivery COD.
 */
export function isValidAlgerianPhone(raw: string): boolean {
  const p = normalizePhone(raw);
  return /^0(5|6|7)[0-9]{8}$/.test(p);
}

export interface CheckoutInput {
  fullName?: unknown;
  phone?: unknown;
  wilayaCode?: unknown;
  deliveryType?: unknown;
  address?: unknown;
  notes?: unknown;
  items?: unknown;
}

export interface ValidationResult {
  ok: boolean;
  /** Field → machine-readable error code (mapped to localized copy client-side). */
  fieldErrors: Record<string, string>;
}

/**
 * Server-side validation of an incoming order. Returns machine-readable codes
 * so the client can render them in the active language.
 */
export function validateCheckout(input: CheckoutInput): ValidationResult {
  const fieldErrors: Record<string, string> = {};

  const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
  if (fullName.length < 3) fieldErrors.fullName = "name_required";

  if (typeof input.phone !== "string" || !isValidAlgerianPhone(input.phone)) {
    fieldErrors.phone = "invalid_phone";
  }

  const code = Number(input.wilayaCode);
  if (!Number.isInteger(code) || code < 1 || code > 58) {
    fieldErrors.wilayaCode = "wilaya_required";
  }

  if (input.deliveryType !== "home" && input.deliveryType !== "stopdesk") {
    fieldErrors.deliveryType = "delivery_required";
  }

  if (input.deliveryType === "home") {
    const address = typeof input.address === "string" ? input.address.trim() : "";
    if (address.length < 5) fieldErrors.address = "address_required";
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    fieldErrors.items = "cart_empty";
  }

  return { ok: Object.keys(fieldErrors).length === 0, fieldErrors };
}
