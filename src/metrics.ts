import { categories, lotStatus, MINUTE } from './model.ts'
import type { Lot } from './model.ts'

const saoPauloMonth = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
})

export function monthKey(at: number) {
  const parts = saoPauloMonth.formatToParts(new Date(at))
  const year = parts.find((part) => part.type === 'year')!.value
  const month = parts.find((part) => part.type === 'month')!.value
  return `${year}-${month}`
}

export function offerMonth(lot: Lot) {
  return lot.offer ? monthKey(lot.offer.events[0].at) : null
}

export function monthKeys(count: number, now: number) {
  const [year, month] = monthKey(now).split('-').map(Number)
  return Array.from({ length: count }, (_, index) =>
    new Date(Date.UTC(year, month - count + index, 1)).toISOString().slice(0, 7),
  )
}

export function calculateImpact(lots: readonly Lot[], months: readonly string[]) {
  const cohort = lots.filter((lot) => {
    const month = offerMonth(lot)
    return month !== null && months.includes(month)
  })
  const completed = cohort.filter((lot) => lotStatus(lot) === 'delivered')
  const total = (records: readonly Lot[]) => records.reduce((sum, lot) => sum + Math.round(lot.weight * 100), 0) / 100
  const offered = total(cohort)
  const delivered = total(completed)
  const acceptedMinutes = cohort.flatMap((lot) => {
    const events = lot.offer!.events
    const accepted = events.find((event) => event.status === 'accepted')
    return accepted ? [(accepted.at - events[0].at) / MINUTE] : []
  }).sort((a, b) => a - b)
  const middle = Math.floor(acceptedMinutes.length / 2)
  const median = acceptedMinutes.length === 0 ? null : (
    acceptedMinutes.length % 2 ? acceptedMinutes[middle] : (acceptedMinutes[middle - 1] + acceptedMinutes[middle]) / 2
  )
  return {
    offered,
    delivered,
    deliveredLots: completed.length,
    receivers: new Set(completed.map((lot) => lot.offer!.receiverId)).size,
    utilization: offered ? delivered / offered * 100 : null,
    cancellations: cohort.length ? cohort.filter((lot) => lotStatus(lot) === 'canceled').length / cohort.length * 100 : null,
    acceptanceMinutes: median,
    months: months.map((month) => ({
      month,
      offered: total(cohort.filter((lot) => offerMonth(lot) === month)),
      delivered: total(completed.filter((lot) => offerMonth(lot) === month)),
    })),
    categories: categories.map((category) => ({ category, weight: total(completed.filter((lot) => lot.category === category)) })),
  }
}
