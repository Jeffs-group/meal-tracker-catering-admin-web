/**
 * Extracts a clean participant/registrant identifier from raw QR payload.
 * Handles plain IDs, JSON payloads (extracting 'rid'), and full URLs.
 * Also caches any bundled verification passcode into sessionStorage.
 */
export function extractCodeFromQrPayload(raw: string): string {
  const trimmed = raw.trim();

  // 1. JSON payload (e.g. {"rid":"JCC100002","code":"DDRLHUF7","team":"CSK","meal":"NON_VEG"})
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      // rid is the registrant code/ID (e.g. "JCC100002")
      // code is the verification passcode (e.g. "DDRLHUF7") when rid is present
      const regId =
        parsed.rid ||
        parsed.registrantCode ||
        parsed.registrationId ||
        parsed.registrantId ||
        parsed.id ||
        parsed.code ||
        trimmed;

      const vCode =
        parsed.verificationCode ||
        parsed.verificationPasscode ||
        parsed.passcode ||
        parsed.vcd ||
        (parsed.rid && parsed.code ? parsed.code : undefined);

      if (typeof window !== "undefined" && vCode) {
        const vCodeStr = String(vCode).trim();
        sessionStorage.setItem("last_scanned_verification_code", vCodeStr);
        if (regId) {
          sessionStorage.setItem(`vcode_${regId}`, vCodeStr);
          sessionStorage.setItem(`vcode_${String(regId).toUpperCase()}`, vCodeStr);
        }
        if (parsed.rid) {
          sessionStorage.setItem(`vcode_${parsed.rid}`, vCodeStr);
          sessionStorage.setItem(`vcode_${String(parsed.rid).toUpperCase()}`, vCodeStr);
        }
        if (parsed.registrantCode) {
          sessionStorage.setItem(`vcode_${parsed.registrantCode}`, vCodeStr);
          sessionStorage.setItem(`vcode_${String(parsed.registrantCode).toUpperCase()}`, vCodeStr);
        }
        if (parsed.id) sessionStorage.setItem(`vcode_${parsed.id}`, vCodeStr);
        if (parsed.registrantId) sessionStorage.setItem(`vcode_${parsed.registrantId}`, vCodeStr);
      }
      return String(regId).trim();
    } catch {
      // Ignore JSON parse failure
    }
  }

  // 1b. Piped format "CODE|VERIFICATION_CODE"
  if (trimmed.includes("|")) {
    const parts = trimmed.split("|");
    const idPart = parts[0]!.trim();
    if (typeof window !== "undefined" && parts[1]?.trim()) {
      const vCodeStr = parts[1].trim();
      sessionStorage.setItem("last_scanned_verification_code", vCodeStr);
      sessionStorage.setItem(`vcode_${idPart}`, vCodeStr);
    }
    return idPart;
  }

  // 2. URL payload (e.g. http://.../meals/registrants/UID-00001 or ?id=UID-00001 or ?rid=LJ2PCHHK)
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.includes("/")
  ) {
    try {
      const url = new URL(trimmed);
      const idParam =
        url.searchParams.get("registrantCode") ||
        url.searchParams.get("code") ||
        url.searchParams.get("rid") ||
        url.searchParams.get("registrationId") ||
        url.searchParams.get("registrantId") ||
        url.searchParams.get("id");
      const vCode =
        url.searchParams.get("verificationCode") ||
        url.searchParams.get("verificationPasscode") ||
        url.searchParams.get("passcode") ||
        url.searchParams.get("vcd");
      if (typeof window !== "undefined" && vCode) {
        const vCodeStr = String(vCode).trim();
        sessionStorage.setItem("last_scanned_verification_code", vCodeStr);
        if (idParam) sessionStorage.setItem(`vcode_${idParam}`, vCodeStr);
      }
      if (idParam) return idParam;

      const segments = url.pathname.split("/").filter(Boolean);
      if (segments.length > 0) {
        return segments[segments.length - 1]!;
      }
    } catch {
      const segments = trimmed.split("/").filter(Boolean);
      if (segments.length > 0) {
        return segments[segments.length - 1]!;
      }
    }
  }

  return trimmed;
}

