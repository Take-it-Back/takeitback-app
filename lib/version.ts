/** True when version `have` is older than `min` (dotted numbers, e.g. "1.2.0"). Unreadable input counts as not older. */
export function isOlder(have: string, min: string): boolean {
  const a = have.split(".").map((n) => parseInt(n, 10));
  const b = min.split(".").map((n) => parseInt(n, 10));
  if (!a.length || !b.length || a.some(Number.isNaN) || b.some(Number.isNaN)) return false;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x < y;
  }
  return false;
}
