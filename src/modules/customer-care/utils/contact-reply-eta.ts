const CUSTOMER_CARE_TIMEZONE = "America/New_York"
const OPEN_HOUR = 11
const CLOSE_HOUR = 23
const DEFAULT_SLA_SECONDS = 4 * 60 * 60
const SUNDAY_SLA_SECONDS = 6 * 60 * 60

type ZonedParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  weekday: number
}

const zonedDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CUSTOMER_CARE_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  weekday: "short",
})

const getZonedParts = (date: Date): ZonedParts => {
  const parts = zonedDateTimeFormatter.formatToParts(date)
  const data: Record<string, string> = {}

  for (const part of parts) {
    if (part.type !== "literal") {
      data[part.type] = part.value
    }
  }

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  return {
    year: Number(data.year),
    month: Number(data.month),
    day: Number(data.day),
    hour: Number(data.hour),
    minute: Number(data.minute),
    second: Number(data.second),
    weekday: weekdayMap[data.weekday] ?? 0,
  }
}

const getOffsetForUtcMs = (utcMs: number): number => {
  const parts = getZonedParts(new Date(utcMs))
  const asUtcMs = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  )

  return asUtcMs - utcMs
}

const zonedLocalToUtcMs = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
  second = 0
): number => {
  const localAsUtcMs = Date.UTC(year, month - 1, day, hour, minute, second)
  const firstOffset = getOffsetForUtcMs(localAsUtcMs)
  let utcMs = localAsUtcMs - firstOffset
  const secondOffset = getOffsetForUtcMs(utcMs)

  if (secondOffset !== firstOffset) {
    utcMs = localAsUtcMs - secondOffset
  }

  return utcMs
}

const isOpenDay = (weekday: number) => weekday >= 0 && weekday <= 6

const getSlaSecondsForWeekday = (weekday: number) =>
  weekday === 0 ? SUNDAY_SLA_SECONDS : DEFAULT_SLA_SECONDS

const isDuringOnlineHours = (parts: ZonedParts) => {
  if (!isOpenDay(parts.weekday)) {
    return false
  }

  return parts.hour >= OPEN_HOUR && parts.hour < CLOSE_HOUR
}

const addDays = (year: number, month: number, day: number, amount: number) => {
  const next = new Date(Date.UTC(year, month - 1, day + amount))
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  }
}

const getWeekdayFromYmd = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month - 1, day)).getUTCDay()

const getNextOpeningUtcMs = (cursorUtcMs: number) => {
  const parts = getZonedParts(new Date(cursorUtcMs))
  const beforeOpen =
    parts.hour < OPEN_HOUR || (parts.hour === OPEN_HOUR && parts.minute === 0 && parts.second === 0)

  if (isOpenDay(parts.weekday) && beforeOpen) {
    return zonedLocalToUtcMs(parts.year, parts.month, parts.day, OPEN_HOUR)
  }

  let candidate = addDays(parts.year, parts.month, parts.day, 1)
  let candidateWeekday = getWeekdayFromYmd(candidate.year, candidate.month, candidate.day)

  while (!isOpenDay(candidateWeekday)) {
    candidate = addDays(candidate.year, candidate.month, candidate.day, 1)
    candidateWeekday = getWeekdayFromYmd(candidate.year, candidate.month, candidate.day)
  }

  return zonedLocalToUtcMs(candidate.year, candidate.month, candidate.day, OPEN_HOUR)
}

export const computeReplyEtaSeconds = (nowUtcMs = Date.now()) => {
  const nowParts = getZonedParts(new Date(nowUtcMs))

  // While customer care is currently online, display a flat day-specific "if sent now" SLA.
  // Closed-hour carryover logic applies only when the store is currently offline.
  if (isDuringOnlineHours(nowParts)) {
    return getSlaSecondsForWeekday(nowParts.weekday)
  }

  let cursorUtcMs = nowUtcMs
  const nextOpenUtcMs = getNextOpeningUtcMs(nowUtcMs)
  const nextOpenParts = getZonedParts(new Date(nextOpenUtcMs))
  let remainingSeconds = getSlaSecondsForWeekday(nextOpenParts.weekday)

  while (remainingSeconds > 0) {
    const cursorParts = getZonedParts(new Date(cursorUtcMs))

    if (isDuringOnlineHours(cursorParts)) {
      const closeUtcMs = zonedLocalToUtcMs(
        cursorParts.year,
        cursorParts.month,
        cursorParts.day,
        CLOSE_HOUR,
        0,
        0
      )

      const secondsUntilClose = Math.max(0, Math.floor((closeUtcMs - cursorUtcMs) / 1000))
      const consumedSeconds = Math.min(remainingSeconds, secondsUntilClose)

      if (consumedSeconds <= 0) {
        cursorUtcMs = closeUtcMs
        continue
      }

      remainingSeconds -= consumedSeconds
      cursorUtcMs += consumedSeconds * 1000
      continue
    }

    cursorUtcMs = getNextOpeningUtcMs(cursorUtcMs)
  }

  return Math.max(0, Math.ceil((cursorUtcMs - nowUtcMs) / 1000))
}

export const formatDurationHHMMSS = (durationSeconds: number) => {
  const total = Math.max(0, Math.floor(durationSeconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export const __private__ = {
  getZonedParts,
  getNextOpeningUtcMs,
  zonedLocalToUtcMs,
}
