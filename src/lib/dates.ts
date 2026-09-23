export const pad = (n: number) => String(n).padStart(2, '0')

/** `YYYY-MM-DD` in local time. */
export const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** `YYYY-MM` in local time. */
export const ymOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`

export const parseDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const daysInMonth = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export const shiftYm = (ym: string, n: number) => {
  const [y, m] = ym.split('-').map(Number)
  return ymOf(new Date(y, m - 1 + n, 1))
}

/** Day of month from an ISO date string. */
export const dayOf = (isoDate: string) => Number(isoDate.slice(8, 10))

export const formatMonth = (ym: string) =>
  parseDate(`${ym}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

export const monthLong = (ym: string) => parseDate(`${ym}-01`).toLocaleDateString('en-GB', { month: 'long' })

export const monthShort = (ym: string) => parseDate(`${ym}-01`).toLocaleDateString('en-GB', { month: 'short' })
