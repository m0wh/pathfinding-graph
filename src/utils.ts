export function lerp (from: number, to: number, amt: number): number {
  return from + (to - from) * amt
}

export function range (val, inMin, inMax, outMin, outMax) {
  return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}

export function randomFromArray (array) {
  const a = array.map(el => ({
    value: el.value === undefined ? el : el.value,
    probability: el.probability === undefined ? 1 : el.probability
  }))

  return a.sort((a, b) => Math.random() * b.probability - Math.random() * a.probability)[0].value
}
