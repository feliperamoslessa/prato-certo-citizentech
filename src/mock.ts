import type { Donation } from './model'

export const receivers = ['Rede Semente (fictícia)', 'Instituto Mesa Aberta (fictício)', 'Casa Horizonte (fictícia)']

export const donations: Donation[] = [
  { id: 'PC-006', category: 'Hortifruti', weight: 24, expires: '2026-11-20T16:00:00-03:00', storage: 'Refrigerado', status: 'delivered', receiver: receivers[0] },
  { id: 'PC-005', category: 'Panificação', weight: 12.5, expires: '2026-11-21T12:00:00-03:00', storage: 'Temperatura ambiente', status: 'collected', receiver: receivers[1] },
  { id: 'PC-004', category: 'Alimentos embalados', weight: 30, expires: '2026-11-27T18:00:00-03:00', storage: 'Temperatura ambiente', status: 'accepted', receiver: receivers[2] },
  { id: 'PC-003', category: 'Hortifruti', weight: 18, expires: '2026-11-22T10:00:00-03:00', storage: 'Refrigerado', status: 'offered', receiver: receivers[0] },
  { id: 'PC-002', category: 'Refeições preparadas', weight: 8, expires: '2026-11-18T18:00:00-03:00', storage: 'Congelado', status: 'pending', receiver: null },
  { id: 'PC-001', category: 'Panificação', weight: 10, expires: '2026-11-10T18:00:00-03:00', storage: 'Temperatura ambiente', status: 'canceled', receiver: receivers[1] },
]

export const monthlyImpact = [
  { month: 'Mai', delivered: 120, offered: 185, lots: 8, active: 3 },
  { month: 'Jun', delivered: 166, offered: 235, lots: 11, active: 4 },
  { month: 'Jul', delivered: 143, offered: 207, lots: 9, active: 4 },
  { month: 'Ago', delivered: 205, offered: 265, lots: 14, active: 5 },
  { month: 'Set', delivered: 217, offered: 288, lots: 16, active: 5 },
  { month: 'Out', delivered: 265, offered: 320, lots: 20, active: 6 },
]

export const categoryShare = [
  { label: 'Hortifruti', value: 42, color: '#204B3B' },
  { label: 'Panificação', value: 28, color: '#739882' },
  { label: 'Alimentos embalados', value: 18, color: '#E89145' },
  { label: 'Refeições preparadas', value: 12, color: '#e9d9ba' },
]
