export const priceCurrencies = ["USD", "EUR", "IRR"] as const;

export type PriceCurrency = (typeof priceCurrencies)[number];

export const defaultCurrency: PriceCurrency = "USD";

export function isPriceCurrency(value: unknown): value is PriceCurrency {
  return typeof value === "string" && priceCurrencies.includes(value as PriceCurrency);
}

export function normalizeCurrency(value: unknown): PriceCurrency {
  return isPriceCurrency(value) ? value : defaultCurrency;
}

export function formatMoney(
  amount: number,
  currency: PriceCurrency,
  locale: string,
  maximumFractionDigits = currency === "IRR" ? 0 : 2
) {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(amount);
}
