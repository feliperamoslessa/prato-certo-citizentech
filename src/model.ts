export const statuses = {
  pending: 'Verificação pendente',
  offered: 'Ofertado',
  accepted: 'Aceito',
  collected: 'Retirado',
  delivered: 'Entregue',
  canceled: 'Cancelado',
} as const

export type Status = keyof typeof statuses
export const categories = ['Hortifruti', 'Panificação', 'Alimentos embalados', 'Refeições preparadas'] as const
export const storageOptions = ['Temperatura ambiente', 'Refrigerado', 'Congelado'] as const

export interface LotInput {
  category: string
  weight: string
  expires: string
  storage: string
}

export interface Donation {
  id: string
  category: string
  weight: number
  expires: string
  storage: string
  status: Status
  receiver: string | null
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
  if (!Number.isFinite(weight) || weight <= 0) errors.weight = 'Informe um peso maior que zero, com até duas casas decimais.'
  if (!Number.isFinite(expiry) || expiry <= now) errors.expires = 'Informe uma data e hora futuras.'
  if (!storageOptions.some((option) => option === input.storage)) errors.storage = 'Selecione uma condição de armazenamento.'
  return errors
}

export function registerLot(input: LotInput, id: string, now = Date.now()): Donation {
  if (Object.keys(validateLot(input, now)).length) throw new Error('Revise os campos do lote.')
  return {
    id,
    category: input.category,
    weight: parseWeight(input.weight),
    expires: new Date(input.expires).toISOString(),
    storage: input.storage,
    status: 'pending',
    receiver: null,
  }
}

export function filterDonations(donations: Donation[], status: string, receiver: string) {
  return donations.filter((donation) =>
    (!status || donation.status === status) && (!receiver || donation.receiver === receiver),
  )
}

export const formatNumber = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format
export const formatDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format
