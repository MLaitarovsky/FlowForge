/**
 * Approximate blended cost per token (USD) for each model.
 * Uses a ~60% input / 40% output split as a rough estimate.
 * Prices sourced from public pricing pages (as of early 2025).
 */
const COST_PER_TOKEN: Record<string, number> = {
  // Anthropic
  'claude-sonnet-4-6':       7.80 / 1_000_000,  // $3 in / $15 out blended
  'claude-opus-4-6':        39.00 / 1_000_000,  // $15 in / $75 out blended
  'claude-haiku-4-5-20251001': 2.08 / 1_000_000, // $0.80 in / $4 out blended
  // OpenAI
  'gpt-4o':                  9.00 / 1_000_000,  // $5 in / $15 out blended
  'gpt-4o-mini':             0.33 / 1_000_000,  // $0.15 in / $0.60 out blended
  'gpt-4-turbo':            18.00 / 1_000_000,  // $10 in / $30 out blended
}

const DEFAULT_COST_PER_TOKEN = 5.00 / 1_000_000 // generic fallback

export function estimateCost(model: string, tokens: number): number {
  const rate = COST_PER_TOKEN[model] ?? DEFAULT_COST_PER_TOKEN
  return rate * tokens
}
