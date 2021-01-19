export function lerp (from: number, to: number, amt: number): number {
  return from + (to - from) * amt
}
