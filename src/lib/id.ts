export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'x' + Math.random().toString(36).slice(2) + Date.now().toString(36)
