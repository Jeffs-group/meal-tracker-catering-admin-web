export function formatPercent(value: number, decimals = 1): string {
  if (isNaN(value)) return "0%";
  return `${Number(value).toFixed(decimals).replace(/\.0$/, "")}%`;
}

export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}
