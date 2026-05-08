import {
  defaultCurrency,
  normalizeCurrency,
  priceCurrencies,
  type PriceCurrency,
} from "@/lib/currency";

const fallbackRatesFromUsd: Record<PriceCurrency, number> = {
  USD: 1,
  EUR: 0.93,
  IRR: 420000,
};

type ExchangeRateResponse = {
  result?: string;
  rates?: Record<string, number>;
};

function fallbackRates(base: PriceCurrency) {
  const baseRate = fallbackRatesFromUsd[base];

  return Object.fromEntries(
    priceCurrencies.map((currency) => [currency, fallbackRatesFromUsd[currency] / baseRate])
  ) as Record<PriceCurrency, number>;
}

export async function getExchangeRates(baseInput: unknown = defaultCurrency) {
  const base = normalizeCurrency(baseInput);

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);

    if (response.ok) {
      const payload = (await response.json()) as ExchangeRateResponse;

      if (payload.result === "success" && payload.rates) {
        const rates = fallbackRates(base);

        for (const currency of priceCurrencies) {
          const rate = payload.rates[currency];

          if (typeof rate === "number" && Number.isFinite(rate) && rate > 0) {
            rates[currency] = rate;
          }
        }

        return { base, rates, source: "open.er-api.com" as const };
      }
    }
  } catch {
    // Pricing must still work offline or if the public exchange API is unavailable.
  }

  return { base, rates: fallbackRates(base), source: "fallback" as const };
}

export async function convertMoney(
  amount: number,
  fromInput: unknown,
  toInput: unknown
) {
  const from = normalizeCurrency(fromInput);
  const to = normalizeCurrency(toInput);

  if (from === to) {
    return amount;
  }

  const { rates } = await getExchangeRates(from);

  return amount * rates[to];
}
