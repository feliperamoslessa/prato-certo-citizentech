import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ArrowRight, Clock3, MapPin, PackageCheck, Scale } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { canOffer, formatDate, formatNumber, recommend, statuses } from './model'
import type { Lot, Receiver } from './model'

export default function Matching({ lots, receivers, now, onOffer }: {
  lots: readonly Lot[]
  receivers: readonly Receiver[]
  now: number
  onOffer: (lotId: string, receiverId: string) => void
}) {
  const candidates = lots.filter((lot) => !lot.offer)
  const [selectedId, setSelectedId] = useState('')
  const [receiverId, setReceiverId] = useState('')
  const [error, setError] = useState('')
  const reduced = useReducedMotion()
  const results = useRef<HTMLDivElement>(null)
  const selected = candidates.find((lot) => lot.id === selectedId)
  const available = selected ? recommend(selected, receivers, now) : []
  const choice = available.find(({ receiver }) => receiver.id === receiverId)

  useLayoutEffect(() => {
    if (reduced !== false) return
    const context = gsap.context(() => {
      gsap.from('.match-result', { opacity: 0, y: 9, stagger: 0.065, duration: 0.28, ease: 'power2.out' })
    }, results)
    return () => context.revert()
  }, [selectedId, reduced])

  return (
    <div className="match-layout">
      <section className="panel tracking-card" aria-labelledby="match-title">
        <div className="section-heading">
          <div><h2 id="match-title">Escolha um lote</h2><p>Recomendações simuladas para instituições fictícias.</p></div>
          <span className="metric-icon"><PackageCheck size={20} aria-hidden="true" /></span>
        </div>
        <label className="field match-select">Lote para análise
          <select value={selected?.id ?? ''} onChange={(event) => { setSelectedId(event.target.value); setReceiverId(''); setError('') }}>
            <option value="">Selecione um lote</option>
            {candidates.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.id} · {lot.category} · {canOffer(lot, now) ? statuses.eligible : lot.checkedAt === null ? statuses.pending : 'Validade encerrada'}
              </option>
            ))}
          </select>
        </label>
        <div ref={results} className="match-results">
          {!selected && <div className="empty-state"><h3>{candidates.length ? 'Selecione um lote para comparar' : 'Nenhum lote disponível para análise'}</h3><p>As recomendações aparecem aqui quando houver compatibilidade.</p></div>}
          {selected && (
            <>
              <p className="muted">{formatNumber(selected.weight)} kg · {selected.storage} · Validade em {formatDate(selected.expiresAt)} (São Paulo)</p>
              <p className="result-count" role="status">{available.length} {available.length === 1 ? 'instituição compatível' : 'instituições compatíveis'}</p>
              {available.length === 0 && (
                <div className="empty-state">
                  <h3>{selected.checkedAt === null ? 'Verificação sanitária pendente' : canOffer(selected, now) ? 'Nenhuma instituição compatível' : 'Validade encerrada'}</h3>
                  <p>{selected.checkedAt === null ? 'O lote só poderá ser ofertado após avaliação humana por profissional habilitado.' : 'O lote precisa estar dentro da validade e a instituição precisa atender aos critérios de recebimento.'}</p>
                </div>
              )}
              {available.length > 0 && (
                <form onSubmit={(event) => {
                  event.preventDefault()
                  if (!choice) { setError('Selecione uma instituição compatível.'); return }
                  try { onOffer(selected.id, choice.receiver.id) }
                  catch (failure) { setError(failure instanceof Error ? failure.message : 'A oferta não pôde ser registrada.') }
                }}>
                  <fieldset>
                    <legend className="sr-only">Instituições recomendadas</legend>
                    <div className="match-options">
                      {available.map(({ receiver, distanceKm, etaMinutes, marginMinutes }, index) => (
                        <motion.label key={receiver.id} className="match-result" whileHover={reduced ? undefined : { x: 2 }}>
                          <input type="radio" name="receiver" value={receiver.id} checked={receiverId === receiver.id} onChange={() => { setReceiverId(receiver.id); setError('') }} />
                          <span className="match-name"><strong>{receiver.name}</strong>{index === 0 && <small>Primeira recomendação</small>}</span>
                          <span className="match-facts">
                            <span><MapPin size={14} aria-hidden="true" />{formatNumber(distanceKm)} km</span>
                            <span><Scale size={14} aria-hidden="true" />{receiver.capacityKg} kg de capacidade</span>
                            <span><Clock3 size={14} aria-hidden="true" />{etaMinutes} min de coleta</span>
                            <span>Margem de {formatNumber(marginMinutes)} min</span>
                          </span>
                        </motion.label>
                      ))}
                    </div>
                  </fieldset>
                  {error && <p className="error-banner" role="alert">{error}</p>}
                  <div className="form-actions">
                    <motion.button whileTap={reduced ? undefined : { scale: 0.98 }} className="button primary" type="submit">
                      Confirmar oferta simulada <ArrowRight size={16} aria-hidden="true" />
                    </motion.button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </section>
      <aside className="panel safety-card" aria-labelledby="rules-title">
        <h2 id="rules-title">Como a recomendação funciona</h2>
        <ol className="rule-list">
          <li>O lote precisa estar verificado, válido e sem oferta registrada.</li>
          <li>A instituição precisa comportar o peso do lote, aceitar a conservação informada e concluir a coleta com pelo menos um minuto de margem.</li>
          <li>A ordem prioriza menor distância, maior margem de validade e maior capacidade declarada.</li>
        </ol>
        <p>A distância vem de um mapa fictício. O prazo de coleta soma o preparo da instituição e três minutos por quilômetro, arredondados para cima.</p>
        <p>A escolha é sua. Confirmar registra uma oferta no cenário local. O aceite é uma etapa separada.</p>
      </aside>
    </div>
  )
}
