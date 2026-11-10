export type QrPayload = { v: 1; memberNumber: string; token: string };

/** Serialises the payload embedded in the member QR card. */
export function buildQrPayload(memberNumber: string, qrToken: string) {
  return JSON.stringify({
    v: 1,
    memberNumber,
    token: qrToken,
  } satisfies QrPayload);
}

/**
 * Parses either a JSON QR payload or a bare SHB-XXXXX member number.
 * Returns null when the value cannot be interpreted.
 */
export function parseQrPayload(raw: string): QrPayload | null {
  try {
    const parsed = JSON.parse(raw) as Partial<QrPayload>;
    if (
      parsed &&
      parsed.v === 1 &&
      typeof parsed.memberNumber === "string" &&
      typeof parsed.token === "string"
    ) {
      return parsed as QrPayload;
    }
  } catch {
    // Not JSON — fall through to member-number matching.
  }

  const trimmed = raw.trim().toUpperCase();
  if (/^SHB-\d{5}$/.test(trimmed)) {
    return { v: 1, memberNumber: trimmed, token: "" };
  }
  return null;
}
