export function plural(n: number, s: string, p?: string) {
  return n === 1 ? s : p ?? `${s}s`;
}
