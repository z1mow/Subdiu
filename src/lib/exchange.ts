/**
 * Döviz kurları — ücretsiz, anahtarsız Frankfurter (ECB) API'si.
 * Sonuç: `base` başına 1 birim = kaç `X` (ör. base USD → { USD: 1, TRY: 32.1, ... }).
 */

const SUPPORTED = ["TRY", "USD", "EUR", "GBP"]

export type Rates = Record<string, number>

export async function getExchangeRates(base: string): Promise<Rates | null> {
  const symbols = SUPPORTED.filter((c) => c !== base)
  if (symbols.length === 0) return { [base]: 1 }

  try {
    const url = `https://api.frankfurter.app/latest?base=${base}&symbols=${symbols.join(",")}`
    // Kurları 1 saat cache'le (sık değişmiyor, her istekte çağrı yapma).
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null

    const data = (await res.json()) as { rates?: Record<string, number> }
    if (!data.rates) return null

    return { [base]: 1, ...data.rates }
  } catch {
    return null
  }
}
