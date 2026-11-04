/**
 * Formats a canonical registrant ID with a uniform '#' display prefix.
 * Keeps the underlying raw ID intact without mutation.
 */
export function formatRegistrantId(id?: string | null): string {
  if (!id) return "";
  const cleaned = id.trim();
  if (cleaned.startsWith("#")) return cleaned;
  return `#${cleaned}`;
}

