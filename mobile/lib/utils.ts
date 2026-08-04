import dayjs from "dayjs";

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($)", name: "US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR (€)", name: "Euro" },
  { code: "GBP", symbol: "£", label: "GBP (£)", name: "British Pound" },
  { code: "INR", symbol: "₹", label: "INR (₹)", name: "Indian Rupee" },
  { code: "PKR", symbol: "Rs", label: "PKR (Rs)", name: "Pakistani Rupee" },
  { code: "JPY", symbol: "¥", label: "JPY (¥)", name: "Japanese Yen" },
  { code: "CAD", symbol: "CA$", label: "CAD (CA$)", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "AUD (A$)", name: "Australian Dollar" },
  { code: "RP.", symbol: "Rp", label: "RP. (Rp)", name: "Indonesian Rupiah" },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]["code"];

const CURRENCY_MAP: Record<string, { locale: string; code: string; symbol: string }> = {
  USD: { locale: "en-US", code: "USD", symbol: "$" },
  EUR: { locale: "de-DE", code: "EUR", symbol: "€" },
  GBP: { locale: "en-GB", code: "GBP", symbol: "£" },
  INR: { locale: "en-IN", code: "INR", symbol: "₹" },
  PKR: { locale: "ur-PK", code: "PKR", symbol: "Rs" },
  JPY: { locale: "ja-JP", code: "JPY", symbol: "¥" },
  CAD: { locale: "en-CA", code: "CAD", symbol: "CA$" },
  AUD: { locale: "en-AU", code: "AUD", symbol: "A$" },
  "RP.": { locale: "id-ID", code: "IDR", symbol: "Rp" },
  IDR: { locale: "id-ID", code: "IDR", symbol: "Rp" },
};

export const formatCurrency = (value: number, currency = "USD"): string => {
  const numValue = Number(value) || 0;
  const currKey = (currency || "USD").toUpperCase();
  const info = CURRENCY_MAP[currKey] || { locale: "en-US", code: "USD", symbol: "$" };
  
  try {
    return new Intl.NumberFormat(info.locale, {
      style: "currency",
      currency: info.code,
      minimumFractionDigits: currKey === "JPY" ? 0 : 2,
      maximumFractionDigits: currKey === "JPY" ? 0 : 2,
    }).format(numValue);
  } catch {
    return `${info.symbol} ${numValue.toFixed(2)}`;
  }
};

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("MM/DD/YYYY") : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};