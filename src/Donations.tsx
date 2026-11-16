import { Fragment, useState } from 'react'
import { ChevronDown, PackageOpen } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { availableEvents, filterLots, formatDate, formatNumber, lotStatus, statuses } from './model'
import type { EventStatus, Lot, Receiver } from './model'

const actions = { accepted: 'Registrar aceite', collected: 'Registrar retirada', delivered: 'Confirmar entrega', canceled: 'Cancelar oferta', offered: 'Ofertar' }

export function Donations({ lots, receivers, now, onAdvance }: {
  lots: readonly Lot[]
  receivers: readonly Receiver[]
  now: number
  onAdvance: (id: string, status: EventStatus) => void
}) {
  const [status, setStatus] = useState('')
  const [receiverId, setReceiverId] = useState('')
  const [expanded, setExpanded] = useState('')
  const [error, setError] = useState('')
  const reduced = useReducedMotion()
  const filtered = filterLots(lots, status, receiverId)

  return (
    <section className="panel tracking-card" aria-labelledby="tracking-title">
      <div className="section-heading"><div><h2 id="tracking-title">Lotes e doações</h2><p>Abra um lote para consultar o histórico ou registrar uma etapa simulada.</p></div></div>
      <div className="filters">
        <label className="field">Status<select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Todos os status</option>
          {Object.entries(statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select></label>
        <label className="field">Instituição receptora<select value={receiverId} onChange={(event) => setReceiverId(event.target.value)}>
          <option value="">Todas as instituições</option>
          {receivers.map(({ id, name }) => <option value={id} key={id}>{name}</option>)}
        </select></label>
        {(status || receiverId) && <button type="button" className="button secondary" onClick={() => { setStatus(''); setReceiverId('') }}>Limpar filtros</button>}
      </div>
      <p className="result-count" role="status">{filtered.length} {filtered.length === 1 ? 'registro simulado' : 'registros simulados'}</p>
      {error && <p className="error-banner" role="alert">{error}</p>}
      {filtered.length === 0 ? (
        <div className="empty-state"><PackageOpen size={26} aria-hidden="true" /><h3>Nenhum lote encontrado</h3><p>Ajuste os filtros ou cadastre um excedente.</p></div>
      ) : (
        <div className="table-region" tabIndex={0} role="region" aria-label="Tabela de lotes e doações simuladas">
          <table className="data-table tracking-table">
            <caption className="sr-only">Lotes e doações simulados. Validade no horário de São Paulo.</caption>
            <thead><tr><th scope="col">Lote</th><th scope="col">Peso</th><th scope="col">Validade</th><th scope="col">Instituição fictícia</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {filtered.map((lot) => {
                const current = lotStatus(lot)
                const open = expanded === lot.id
                const receiver = receivers.find(({ id }) => id === lot.offer?.receiverId)
                const detailId = `details-${lot.id}`
                return (
                  <Fragment key={lot.id}>
                    <tr>
                      <th scope="row"><button type="button" className="lot-toggle" aria-expanded={open} aria-controls={detailId} onClick={() => { setExpanded(open ? '' : lot.id); setError('') }}>
                        <ChevronDown size={16} aria-hidden="true" /><span><small>{lot.id}</small>{lot.category}</span>
                      </button></th>
                      <td>{formatNumber(lot.weight)} kg</td>
                      <td>{formatDate(lot.expiresAt)}</td>
                      <td>{receiver?.name ?? '—'}</td>
                      <td><span className={`status status-${current}`}>{current === 'eligible' && lot.expiresAt <= now ? 'Validade encerrada' : statuses[current]}</span></td>
                    </tr>
                    <tr id={detailId} hidden={!open} className="detail-row"><td colSpan={5}>
                      {open && <motion.div initial={reduced ? false : { opacity: 0.55, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="lot-detail">
                        <p><strong>Conservação</strong> · {lot.storage}</p>
                        {lot.checkedAt !== null && <p><strong>Verificação no cenário</strong> · {formatDate(lot.checkedAt)}</p>}
                        {lot.offer ? <ol className="event-track" aria-label="Histórico simulado">
                          {lot.offer.events.map((event) => <li key={event.status}><strong>{statuses[event.status]}</strong><span>{formatDate(event.at)}</span></li>)}
                        </ol> : <p>{current === 'pending' ? 'Aguardando avaliação sanitária humana.' : 'Nenhuma oferta registrada.'}</p>}
                        <div className="event-actions">
                          {availableEvents(lot, now).map((event) => (
                            <motion.button type="button" whileTap={reduced ? undefined : { scale: 0.98 }} key={event} className={`button ${event === 'canceled' ? 'secondary' : 'primary'}`} onClick={() => {
                              try { onAdvance(lot.id, event); setError('') }
                              catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível registrar a etapa.') }
                            }}>{actions[event]}</motion.button>
                          ))}
                        </div>
                      </motion.div>}
                    </td></tr>
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
