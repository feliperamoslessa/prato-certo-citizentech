import { categories, lotStatus, recommend, storageOptions, advanceLot } from './model.ts'
import type { Lot, LotEvent, Receiver } from './model.ts'

export const storageKey = 'prato-certo:scenario:v1'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTime(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= 8.64e15
}

export function decodeScenario(raw: string, receivers: readonly Receiver[]): Lot[] {
  const data: unknown = JSON.parse(raw)
  if (!isObject(data) || data.version !== 1 || !Array.isArray(data.lots)) throw new Error('Formato de cenário inválido.')
  const ids = new Set<string>()
  return data.lots.map((candidate: unknown) => {
    if (!isObject(candidate)) throw new Error('Lote inválido.')
    const { id, category, weight, createdAt, expiresAt, storage, point, checkedAt, offer } = candidate
    const validCategory = categories.find((option) => option === category)
    const validStorage = storageOptions.find((option) => option === storage)
    if (typeof id !== 'string' || !/^PC-\d+$/.test(id) || ids.has(id) ||
        !validCategory || !validStorage ||
        typeof weight !== 'number' || weight <= 0 || !Number.isSafeInteger(Math.round(weight * 100)) ||
        Math.abs(weight - Math.round(weight * 100) / 100) > 1e-9 ||
        !isTime(createdAt) || !isTime(expiresAt) || expiresAt <= createdAt ||
        !Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite) ||
        (checkedAt !== null && (!isTime(checkedAt) || checkedAt < createdAt || checkedAt >= expiresAt))) {
      throw new Error('Dados do lote inválidos.')
    }
    ids.add(id)
    const lot: Lot = {
      id, category: validCategory, weight, createdAt, expiresAt, storage: validStorage,
      point: [point[0], point[1]], checkedAt, offer: null,
    }
    if (offer === null) return lot
    if (!isObject(offer) || typeof offer.receiverId !== 'string' || !Array.isArray(offer.events) ||
        offer.events.length < 1 || offer.events.length > 4) throw new Error('Oferta inválida.')
    const [first, ...rest] = offer.events as unknown[]
    const receiverId = offer.receiverId
    if (!isObject(first) || first.status !== 'offered' || !isTime(first.at) ||
        !recommend(lot, receivers, first.at).some(({ receiver }) => receiver.id === receiverId)) {
      throw new Error('Oferta incompatível com o lote.')
    }
    const offered: Lot = { ...lot, offer: { receiverId, events: [{ status: 'offered', at: first.at }] } }
    return rest.reduce<Lot>((record, event) => {
      if (!isObject(event) || !isTime(event.at) || typeof event.status !== 'string' ||
          ['pending', 'eligible', lotStatus(record)].includes(event.status)) throw new Error('Histórico inválido.')
      return advanceLot(record, event.status as LotEvent['status'], event.at)
    }, offered)
  })
}

export function encodeScenario(lots: readonly Lot[]) {
  return JSON.stringify({ version: 1, lots })
}
