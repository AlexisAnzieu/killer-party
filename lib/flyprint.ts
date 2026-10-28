export const FLYPRINT_URL =
  process.env.NEXT_PUBLIC_FLYPRINT_URL || "https://print.flybooth.app";

export async function isPrinterAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${FLYPRINT_URL}/api/printer-status`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return Boolean(data.connected);
  } catch {
    return false;
  }
}
