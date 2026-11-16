import { categories, lotStatus, MINUTE } from './model.ts'
import type { Lot } from './model.ts'

export function offerMonth(lot: Lot) {
  return lot.offer ? new Date(lot.offer.events[0].at).toISOString().slice(0, 7) : null
}

export function monthKeys(count: number, now: number) {
  const date = new Date(now)
  return Array.from({ length: count }, (_, index) =>
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - count + 1 + index, 1)).toISOString().slice(0, 7),
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
