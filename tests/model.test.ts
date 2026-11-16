import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { filterDonations, registerLot, validateLot } from '../src/model.ts'
import type { Donation } from '../src/model.ts'

const now = Date.parse('2026-11-16T12:00:00Z')
const valid = {
  category: 'Hortifruti',
  weight: '12,50',
  expires: '2026-11-17T12:00:00Z',
  storage: 'Refrigerado',
}

test('aceita peso com vírgula e validade futura', () => {
  assert.deepEqual(validateLot(valid, now), {})
})

test('sinaliza campos obrigatórios ausentes', () => {
  const errors = validateLot({ category: '', weight: '', expires: '', storage: '' }, now)
  assert.deepEqual(Object.keys(errors), ['category', 'weight', 'expires', 'storage'])
})

test('rejeita peso inválido, validade expirada e opções fora do domínio', () => {
  for (const weight of ['-1', '0', '1,234', '12kg', '1e2', 'Infinity']) {
    assert.ok(validateLot({ ...valid, weight }, now).weight, weight)
  }
  assert.ok(validateLot({ ...valid, expires: '2026-11-16T12:00:00Z' }, now).expires)
  assert.ok(validateLot({ ...valid, expires: 'inválida' }, now).expires)
  assert.ok(validateLot({ ...valid, category: 'Outra' }, now).category)
  assert.ok(validateLot({ ...valid, storage: 'Outro' }, now).storage)
})

test('cadastra lote válido como pendente, sem instituição receptora', () => {
  const lot = registerLot(valid, 'PC-007', now)
  assert.equal(lot.id, 'PC-007')
  assert.equal(lot.weight, 12.5)
  assert.equal(lot.expires, '2026-11-17T12:00:00.000Z')
  assert.equal(lot.status, 'pending')
  assert.equal(lot.receiver, null)
  assert.throws(() => registerLot({ ...valid, weight: '0' }, 'PC-008', now))
})

test('combina filtros de status e instituição e retorna lista vazia sem correspondências', () => {
  const pending = registerLot(valid, 'PC-007', now)
  const accepted: Donation = { ...pending, id: 'PC-005', status: 'accepted', receiver: 'Instituição A' }
  const delivered: Donation = { ...accepted, id: 'PC-006', status: 'delivered' }
  const records = [pending, accepted, delivered]
  assert.deepEqual(filterDonations(records, '', ''), records)
  assert.deepEqual(filterDonations(records, '', 'Instituição A'), [accepted, delivered])
  assert.deepEqual(filterDonations(records, 'pending', ''), [pending])
  assert.deepEqual(filterDonations(records, 'accepted', 'Instituição A'), [accepted])
  assert.deepEqual(filterDonations(records, 'pending', 'Instituição A'), [])
})
