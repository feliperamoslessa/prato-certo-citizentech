export const statuses = {
  pending: 'Verificação pendente',
  eligible: 'Elegível',
  offered: 'Ofertado',
  accepted: 'Aceito',
  collected: 'Retirado',
  delivered: 'Entregue',
  canceled: 'Cancelado',
} as const

export const categories = ['Hortifruti', 'Panificação', 'Alimentos embalados', 'Refeições preparadas'] as const
export const storageOptions = ['Temperatura ambiente', 'Refrigerado', 'Congelado'] as const
export type Category = (typeof categories)[number]
export type Storage = (typeof storageOptions)[number]
export type Status = keyof typeof statuses
export type EventStatus = Exclude<Status, 'pending' | 'eligible'>
export type Point = readonly [number, number]

export interface LotInput {
  category: string
  weight: string
  expires: string
  storage: string
}

export interface Receiver {
  id: string
  name: string
  capacityKg: number
  storage: readonly Storage[]
  point: Point
  prepMinutes: number
}

export interface LotEvent {
  status: EventStatus
  at: number
}

export interface Lot {
  id: string
  category: Category
  weight: number
  createdAt: number
  expiresAt: number
  storage: Storage
  point: Point
  checkedAt: number | null
  offer: { receiverId: string; events: LotEvent[] } | null
}

export const MINUTE = 60_000
export const day = 24 * 60 * MINUTE
export const donationFlow = ['offered', 'accepted', 'collected', 'delivered'] as const
const nextEvents: Record<EventStatus, readonly EventStatus[]> = {
  offered: ['accepted', 'canceled'],
  accepted: ['collected', 'canceled'],
  collected: ['delivered', 'canceled'],
  delivered: [],
  canceled: [],
}

export function parseWeight(value: string) {
  return /^\d+(?:[.,]\d{1,2})?$/.test(value.trim())
    ? Number(value.trim().replace(',', '.'))
    : NaN
}

export function validateLot(input: LotInput, now = Date.now()) {
  const errors: Partial<Record<keyof LotInput, string>> = {}
  const weight = parseWeight(input.weight)
  const expiry = Date.parse(input.expires)
  if (!categories.some((category) => category === input.category)) errors.category = 'Selecione um tipo de alimento.'
  if (!Number.isSafeInteger(Math.round(weight * 100)) || weight <= 0) errors.weight = 'Informe um peso maior que zero, com até duas casas decimais.'
  if (!Number.isFinite(expiry) || expiry <= now) errors.expires = 'Informe uma data e hora futuras.'
  if (!storageOptions.some((option) => option === input.storage)) errors.storage = 'Selecione uma condição de armazenamento.'
  return errors
}

export function registerLot(input: LotInput, id: string, now = Date.now()): Lot {
  if (Object.keys(validateLot(input, now)).length) throw new Error('Revise os campos do lote.')
  return {
    id,
    category: input.category as Category,
    weight: parseWeight(input.weight),
    createdAt: now,
    expiresAt: Date.parse(input.expires),
    storage: input.storage as Storage,
    point: [0, 0],
    checkedAt: null,
    offer: null,
  }
}

export function lotStatus(lot: Lot): Status {
  return lot.offer?.events.at(-1)?.status ?? (lot.checkedAt === null ? 'pending' : 'eligible')
}

export function canOffer(lot: Lot, now: number) {
  return lot.offer === null && lot.checkedAt !== null && lot.checkedAt >= lot.createdAt &&
    lot.checkedAt <= now && lot.expiresAt > now &&
    Number.isFinite(lot.weight) && lot.weight > 0 && storageOptions.includes(lot.storage)
}

export function recommend(lot: Lot, receivers: readonly Receiver[], now: number) {
  if (!canOffer(lot, now)) return []
  return receivers.flatMap((receiver) => {
    if (receiver.capacityKg < lot.weight || !receiver.storage.includes(lot.storage)) return []
    const distanceKm = Math.hypot(lot.point[0] - receiver.point[0], lot.point[1] - receiver.point[1])
    const etaMinutes = receiver.prepMinutes + Math.ceil(distanceKm * 3)
    const marginMinutes = Math.floor((lot.expiresAt - now) / MINUTE - etaMinutes)
    if (marginMinutes < 1) return []
    return [{ receiver, distanceKm, etaMinutes, marginMinutes }]
  }).sort((a, b) =>
    a.distanceKm - b.distanceKm ||
    b.marginMinutes - a.marginMinutes ||
    b.receiver.capacityKg - a.receiver.capacityKg ||
    a.receiver.id.localeCompare(b.receiver.id),
  )
}

export function offerLot(lot: Lot, receiverId: string, receivers: readonly Receiver[], now: number): Lot {
  if (!recommend(lot, receivers, now).some(({ receiver }) => receiver.id === receiverId)) {
    throw new Error('Oferta indisponível. Confira a verificação sanitária, a validade e os critérios da instituição.')
  }
  return { ...lot, offer: { receiverId, events: [{ status: 'offered', at: now }] } }
}

export function availableEvents(lot: Lot, now: number): readonly EventStatus[] {
  const last = lot.offer?.events.at(-1)
  if (!last || now < last.at) return []
  return nextEvents[last.status].filter((status) => status === 'canceled' || now < lot.expiresAt)
}

export function advanceLot(lot: Lot, status: EventStatus, now: number): Lot {
  if (!lot.offer || !availableEvents(lot, now).includes(status)) {
    throw new Error('A transição solicitada não está disponível para este lote.')
  }
  return { ...lot, offer: { ...lot.offer, events: [...lot.offer.events, { status, at: now }] } }
}

export function filterLots(lots: readonly Lot[], status: string, receiverId: string) {
  return lots.filter((lot) =>
    (!status || lotStatus(lot) === status) && (!receiverId || lot.offer?.receiverId === receiverId),
  )
}

export const formatNumber = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format
export const formatDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format
