/** Stable public reference derived from the existing unique order sequence. */
export function formatOrderNumber(value: number | string): string {
  const raw = String(value);
  if (/^114-\d{7}-\d{7}$/.test(raw)) return raw;
  const sequence = raw.replace(/^(AM|TEST)-/, "");
  if (!/^\d+$/.test(sequence)) throw new Error("Invalid order reference");
  const digits = (54010224638624n + BigInt(sequence)).toString();
  if (digits.length !== 14) throw new Error("Order reference exceeds supported range");
  return `114-${digits.slice(0, 7)}-${digits.slice(7)}`;
}
