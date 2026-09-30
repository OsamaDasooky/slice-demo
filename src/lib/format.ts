const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/** Demo "today" is pinned so seeded future dates stay valid. */
export const DEMO_TODAY = new Date(2026, 8, 30)

export function formatCreationDate(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function formatTimestamp(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${formatCreationDate(date)}, ${hours}:${minutes}`
}

/** Parses DD-MMM-YYYY, returning null when the shape or month is invalid. */
export function parseActionDate(value: string): Date | null {
  const match = /^(\d{2})-([A-Za-z]{3})-(\d{4})$/.exec(value.trim())
  if (!match) return null
  const month = MONTHS.findIndex(
    (name) => name.toLowerCase() === match[2].toLowerCase(),
  )
  if (month < 0) return null
  const day = Number(match[1])
  const parsed = new Date(Number(match[3]), month, day)
  return parsed.getDate() === day ? parsed : null
}

/** Reads the "28 Sep 2026" prefix of a submitted-on timestamp. */
export function parseCreationDate(value: string): Date | null {
  const match = /^(\d{2})\s([A-Za-z]{3})\s(\d{4})/.exec(value.trim())
  if (!match) return null
  const month = MONTHS.findIndex(
    (name) => name.toLowerCase() === match[2].toLowerCase(),
  )
  if (month < 0) return null
  return new Date(Number(match[3]), month, Number(match[1]))
}

/** DD-MMM-YYYY -> the yyyy-mm-dd value a native date input expects. */
export function toDateInput(display: string) {
  const parsed = parseActionDate(display)
  if (!parsed) return ""
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const day = String(parsed.getDate()).padStart(2, "0")
  return `${parsed.getFullYear()}-${month}-${day}`
}

/** yyyy-mm-dd from a native date input -> DD-MMM-YYYY. */
export function fromDateInput(value: string) {
  if (!value) return ""
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return ""
  return `${String(day).padStart(2, "0")}-${MONTHS[month - 1]}-${year}`
}

export function isPastDate(value: string) {
  const parsed = parseActionDate(value)
  if (!parsed) return false
  return parsed.getTime() < DEMO_TODAY.getTime()
}

export function formatAmount(value: string) {
  if (!value) return "—"
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return value
  return numeric.toLocaleString("en-US")
}

export function sliceFlagLabel(flag: string) {
  if (flag === "2") return "2 — Slice by Network"
  if (flag === "3") return "3 — Slice by Merchant"
  return flag
}

export function feeTypeLabel(type: string) {
  if (type === "P") return "P — Percentage"
  if (type === "F") return "F — Flat"
  return type
}

/** Bulk uploads are presented as an Add action. */
export function actionLabel(action: string) {
  return action === "Bulk Upload" ? "Add" : action
}

export function frequencyLabel(value: string) {
  if (value === "D") return "D — Daily"
  if (value === "M") return "M — Monthly"
  return value
}

export function downloadTextFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
