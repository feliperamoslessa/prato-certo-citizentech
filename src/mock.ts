import { day, MINUTE } from './model.ts'
import type { EventStatus, Lot, Receiver } from './model.ts'

export const receivers = [
  { id: 'R01', name: 'Rede Semente', capacityKg: 25, storage: ['Temperatura ambiente', 'Refrigerado'], point: [2, 1], prepMinutes: 35 },
  { id: 'R02', name: 'Instituto Mesa Aberta', capacityKg: 60, storage: ['Temperatura ambiente', 'Refrigerado', 'Congelado'], point: [4, 2], prepMinutes: 25 },
  { id: 'R03', name: 'Casa Horizonte', capacityKg: 40, storage: ['Temperatura ambiente'], point: [1, 1], prepMinutes: 50 },
] as const satisfies readonly Receiver[]

const historicalLots = [
  ['Hortifruti', 35, 'Refrigerado', 'R02', 'delivered', 5],
  ['Panificação', 24, 'Temperatura ambiente', 'R03', 'canceled', 5],
  ['Alimentos embalados', 37, 'Temperatura ambiente', 'R03', 'delivered', 4],
  ['Hortifruti', 35, 'Refrigerado', 'R02', 'canceled', 4],
  ['Refeições preparadas', 42, 'Congelado', 'R02', 'delivered', 3],
  ['Panificação', 32, 'Temperatura ambiente', 'R03', 'delivered', 2],
  ['Hortifruti', 24, 'Refrigerado', 'R01', 'canceled', 2],
  ['Hortifruti', 45, 'Refrigerado', 'R02', 'delivered', 1],
  ['Panificação', 22, 'Temperatura ambiente', 'R01', 'delivered', 1],
  ['Alimentos embalados', 33, 'Temperatura ambiente', 'R03', 'canceled', 1],
] as const

function history(status: EventStatus, at: number) {
  const steps: Record<EventStatus, EventStatus[]> = {
    offered: ['offered'],
    accepted: ['offered', 'accepted'],
    collected: ['offered', 'accepted', 'collected'],
    delivered: ['offered', 'accepted', 'collected', 'delivered'],
    canceled: ['offered', 'canceled'],
  }
  return steps[status].map((step, index) => ({ status: step, at: at + index * 45 * MINUTE }))
}

export function createScenario(now = Date.now()): Lot[] {
  const date = new Date(now)
  const historical = historicalLots.map(([category, weight, storage, receiverId, status, monthsAgo], index): Lot => {
    const at = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - monthsAgo, 12, 14)
    return {
      id: `PC-${String(index + 1).padStart(3, '0')}`,
      category, weight, storage, createdAt: at - day, expiresAt: at + 2 * day, point: [0, 0],
      checkedAt: at - 60 * MINUTE, offer: { receiverId, events: history(status, at) },
    }
  })
  const active: Lot[] = [
    { id: 'PC-011', category: 'Hortifruti', weight: 18, storage: 'Refrigerado', createdAt: now - day, expiresAt: now + 2 * day, checkedAt: now - 60 * MINUTE, point: [0, 0], offer: null },
    { id: 'PC-012', category: 'Panificação', weight: 32, storage: 'Temperatura ambiente', createdAt: now - day, expiresAt: now + day, checkedAt: now - 60 * MINUTE, point: [0, 0], offer: null },
    { id: 'PC-013', category: 'Refeições preparadas', weight: 8, storage: 'Congelado', createdAt: now - day, expiresAt: now + day, checkedAt: null, point: [0, 0], offer: null },
    { id: 'PC-014', category: 'Refeições preparadas', weight: 18, storage: 'Congelado', createdAt: now - day, expiresAt: now + 15 * MINUTE, checkedAt: now - 60 * MINUTE, point: [0, 0], offer: null },
    { id: 'PC-015', category: 'Panificação', weight: 25, storage: 'Temperatura ambiente', createdAt: now - day, expiresAt: now + day, checkedAt: now - 6 * 60 * MINUTE, point: [0, 0], offer: { receiverId: 'R03', events: history('collected', now - 4 * 60 * MINUTE) } },
  ]
  return [...historical, ...active].reverse()
}
