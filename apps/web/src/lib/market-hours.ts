// Whether Xetra is trading, from the clock alone: Monday to Friday, 09:00 to 17:30 in
// Frankfurt. Exchange holidays are not known here; on those days it reads "offen" wrongly.

const OPEN = 9 * 60
const CLOSE = 17 * 60 + 30
const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
const ENGLISH_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const frankfurt = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

function frankfurtClock(now: Date) {
  const parts = Object.fromEntries(
    frankfurt.formatToParts(now).map((part) => [part.type, part.value])
  )
  const hour = Number(parts.hour)
  const minute = Number(parts.minute)
  return {
    weekday: ENGLISH_WEEKDAYS.indexOf(parts.weekday),
    minutes: hour * 60 + minute,
    time: `${parts.hour}:${parts.minute}`,
  }
}

const isTradingDay = (weekday: number) => weekday >= 1 && weekday <= 5

export type MarketStatus = { open: boolean; text: string }

export function xetraStatus(now: Date): MarketStatus {
  const { weekday, minutes, time } = frankfurtClock(now)
  if (isTradingDay(weekday) && minutes >= OPEN && minutes < CLOSE) {
    return { open: true, text: `Xetra offen · ${time}` }
  }
  if (isTradingDay(weekday) && minutes < OPEN) {
    return { open: false, text: "Xetra geschlossen · öffnet 09:00" }
  }
  let days = 1
  while (!isTradingDay((weekday + days) % 7)) days++
  const when = days === 1 ? "morgen" : WEEKDAYS[(weekday + days) % 7]
  return { open: false, text: `Xetra geschlossen · öffnet ${when} 09:00` }
}
