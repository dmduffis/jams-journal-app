/**
 * Format count for display: 1000 → "1.0k", 12500 → "12.5k", 1000000 → "1.0M".
 */
export function formatCount(n) {
  if (typeof n !== "number" || n < 0) return "0";
  if (n < 1000) return String(n);
  if (n < 1e6) return (n / 1000).toFixed(1) + "k";
  return (n / 1e6).toFixed(1) + "M";
}
