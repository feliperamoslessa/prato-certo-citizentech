import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { advanceLot, filterLots, lotStatus, offerLot, recommend, registerLot, validateLot } from '../src/model.ts'
import { createScenario, receivers } from '../src/mock.ts'
import { calculateImpact, monthKey, monthKeys, offerMonth } from '../src/metrics.ts'
import { decodeScenario, encodeScenario } from '../src/scenarioStorage.ts'

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

const fixture = createScenario(now)
const lot = (id: string) => fixture.find((record) => record.id === id)!

test('o cenário tem IDs únicos, categorias válidas e ofertas com histórico íntegro', () => {
  assert.equal(new Set(fixture.map(({ id }) => id)).size, fixture.length)
  assert.deepEqual(decodeScenario(encodeScenario(fixture), receivers), fixture)
})

test('cadastro cria lote pendente que não pode ser recomendado, ofertado ou avançado', () => {
  const pending = registerLot(valid, 'PC-016', now)
  assert.equal(pending.weight, 12.5)
  assert.equal(pending.expiresAt, Date.parse(valid.expires))
  assert.equal(lotStatus(pending), 'pending')
  assert.deepEqual(recommend(pending, receivers, now), [])
  assert.throws(() => offerLot(pending, 'R02', receivers, now), /verificação sanitária/)
  assert.throws(() => advanceLot(pending, 'accepted', now))
  assert.throws(() => registerLot({ ...valid, weight: '0' }, 'PC-017', now))
})

test('matching aplica distância, capacidade, conservação, margem e validade', () => {
  const eligible = lot('PC-011')
  const matches = recommend(eligible, receivers, now)
  assert.deepEqual(matches.map(({ receiver }) => receiver.id), ['R01', 'R02'])
  assert.equal(matches[0].distanceKm, Math.hypot(2, 1))
  assert.equal(matches[0].etaMinutes, 42)
  assert.deepEqual(recommend({ ...eligible, weight: 26 }, receivers, now).map(({ receiver }) => receiver.id), ['R02'])
  assert.deepEqual(recommend(lot('PC-014'), receivers, now), [])
  assert.deepEqual(recommend(eligible, receivers, eligible.expiresAt), [])
  assert.throws(() => offerLot(eligible, 'R03', receivers, now))
})

test('a confirmação é explícita e o histórico só permite transições válidas', () => {
  const eligible = lot('PC-011')
  const offered = offerLot(eligible, 'R02', receivers, now)
  assert.equal(lotStatus(eligible), 'eligible')
  assert.equal(lotStatus(offered), 'offered')
  assert.throws(() => offerLot(offered, 'R02', receivers, now))
  assert.throws(() => advanceLot(offered, 'delivered', now))
  assert.throws(() => advanceLot(offered, 'accepted', now - 1))
  assert.throws(() => advanceLot(offered, 'accepted', offered.expiresAt))
  const accepted = advanceLot(offered, 'accepted', now + 1)
  const collected = advanceLot(accepted, 'collected', now + 2)
  const delivered = advanceLot(collected, 'delivered', now + 3)
  assert.deepEqual(delivered.offer?.events.map(({ status }) => status), ['offered', 'accepted', 'collected', 'delivered'])
  assert.throws(() => advanceLot(delivered, 'canceled', now + 4))
  assert.equal(lotStatus(advanceLot(offered, 'canceled', offered.expiresAt)), 'canceled')
})

test('filtros combinam instituição e status derivado', () => {
  assert.deepEqual(filterLots(fixture, 'pending', 'R01'), [])
  assert.deepEqual(filterLots(fixture, 'delivered', 'R01').map(({ id }) => id), ['PC-009'])
})

test('totais, gráfico e perfil usam o mesmo conjunto de ofertas', () => {
  const data = calculateImpact(fixture, monthKeys(6, now))
  assert.equal(data.delivered, 213)
  assert.equal(data.offered, 354)
  assert.equal(data.deliveredLots, 6)
  assert.equal(data.receivers, 3)
  assert.equal(data.utilization, 213 / 354 * 100)
  assert.equal(data.cancellations, 4 / 11 * 100)
  assert.equal(data.acceptanceMinutes, 45)
  assert.equal(data.months.reduce((sum, month) => sum + month.delivered, 0), data.delivered)
  assert.equal(data.categories.reduce((sum, category) => sum + category.weight, 0), data.delivered)
})

test('uma nova oferta e a entrega alteram a mesma coorte', () => {
  const months = monthKeys(1, now)
  const before = calculateImpact(fixture, months)
  assert.equal(before.offered, 25)
  assert.equal(before.delivered, 0)
  const updated = fixture.map((record) => record.id === 'PC-015' ? advanceLot(record, 'delivered', now) : record)
  const after = calculateImpact(updated, months)
  assert.equal(after.delivered, 25)
  assert.equal(after.utilization, 100)
  assert.equal(calculateImpact(fixture, ['2000-01']).utilization, null)
})

test('armazenamento rejeita corrupção, duplicidade e oferta sem verificação', () => {
  assert.throws(() => decodeScenario('{', receivers))
  assert.throws(() => decodeScenario(encodeScenario([fixture[0], fixture[0]]), receivers))
  assert.throws(() => decodeScenario(encodeScenario([{ ...fixture[0], checkedAt: null }]), receivers))
  assert.throws(() => decodeScenario(encodeScenario([{ ...fixture[0], offer: { receiverId: 'inexistente', events: fixture[0].offer!.events } }]), receivers))
})

test('agrupa ofertas na data local de São Paulo durante a virada de mês', () => {
  // 01:30 UTC ainda corresponde a 22:30 do dia 31/10 em São Paulo.
  const octoberLate = Date.parse('2026-11-01T01:30:00Z')
  const novemberEarly = Date.parse('2026-11-01T03:30:00Z')
  assert.equal(monthKey(octoberLate), '2026-10')
  assert.equal(monthKey(novemberEarly), '2026-11')
  assert.deepEqual(monthKeys(2, octoberLate), ['2026-09', '2026-10'])
  assert.deepEqual(monthKeys(2, novemberEarly), ['2026-10', '2026-11'])

  const example = {
    ...lot('PC-011'),
    offer: { receiverId: 'R01', events: [{ status: 'offered' as const, at: octoberLate }] },
  }
  assert.equal(offerMonth(example), '2026-10')
  assert.equal(calculateImpact([example], ['2026-10']).offered, example.weight)
  assert.equal(calculateImpact([example], ['2026-11']).offered, 0)
})
