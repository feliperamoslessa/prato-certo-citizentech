import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Box, ChartNoAxesColumnIncreasing, Clock3, HandHeart, Scale, XCircle } from 'lucide-react'
import { ImpactHero } from './ImpactHero'
import { calculateImpact, monthKeys } from './metrics'
import { formatNumber } from './model'
import type { Lot } from './model'

const colors = ['#204b3b', '#739882', '#e89145', '#e9d9ba']
const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' })
const formatMonth = (value: string) => monthLabel.format(new Date(`${value}-01T00:00:00Z`)).replace('.', '')

export function Dashboard({ lots, now }: { lots: readonly Lot[]; now: number }) {
  const reduced = useReducedMotion()
  const chartId = useId()
  const [period, setPeriod] = useState(6)
  const data = calculateImpact(lots, monthKeys(period, now))
  const largest = Math.max(0, ...data.months.map((month) => month.offered))
  const step = Math.max(5, Math.ceil(largest / 20) * 5)
  const axis = [4, 3, 2, 1, 0].map((tick) => tick * step)
  const metrics = [
    { name: 'Alimentos entregues', value: data.delivered, unit: 'kg', note: 'Peso com entrega confirmada', icon: Scale },
    { name: 'Lotes entregues', value: data.deliveredLots, note: 'Doações concluídas', icon: Box },
    { name: 'Aproveitamento', value: data.utilization, unit: '%', note: 'Peso entregue ÷ peso ofertado', icon: ChartNoAxesColumnIncreasing },
    { name: 'Receptoras atendidas', value: data.receivers, note: 'Instituições distintas com entrega', icon: HandHeart },
    { name: 'Tempo mediano de aceite', value: data.acceptanceMinutes, unit: 'min', note: 'Da oferta até o aceite', icon: Clock3 },
    { name: 'Cancelamento', value: data.cancellations, unit: '%', note: 'Lotes cancelados ÷ lotes ofertados', icon: XCircle },
  ]
  let offset = 0
  const shares = data.categories.map(({ category, weight }, index) => {
    const value = data.delivered ? 100 * weight / data.delivered : 0
    const start = offset
    offset += value
    return { category, weight, value, start, end: offset, color: colors[index] }
  })
  const gradient = shares.map(({ color, start, end }) => `${color} ${start}% ${end}%`).join(', ')

  return (
    <>
      <ImpactHero />
      <section aria-labelledby="indicators" className="space-y-4">
        <div className="section-heading">
          <div><h2 id="indicators">Indicadores de impacto</h2><p>Dados simulados · mês da oferta no horário de São Paulo</p></div>
          <label className="period">
            <span className="sr-only">Período dos indicadores</span>
            <select value={period} onChange={(event) => setPeriod(Number(event.target.value))}>
              <option value={6}>Últimos 6 meses</option>
              <option value={3}>Últimos 3 meses</option>
              <option value={1}>Mês atual</option>
            </select>
          </label>
        </div>
        <p className="sr-only" role="status">Período de {formatMonth(data.months[0].month)} a {formatMonth(data.months.at(-1)!.month)}. {formatNumber(data.delivered)} kg entregues de {formatNumber(data.offered)} kg ofertados.</p>
        <div className="metrics-grid">
          {metrics.map(({ name, value, unit, note, icon: Icon }, index) => (
            <motion.article className="panel metric" key={name}
              initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              whileHover={reduced ? undefined : { y: -3 }} transition={{ duration: 0.22, opacity: { delay: index * 0.04 } }}>
              <div className="metric-icon"><Icon size={19} aria-hidden="true" /></div>
              <h3>{name}</h3>
              <motion.p key={value ?? 'empty'} className="metric-value" initial={reduced ? false : { opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                {value === null ? <><span className="sr-only">Sem dados</span><span aria-hidden="true">—</span></> : <>{formatNumber(value)}<span>{unit}</span></>}
              </motion.p>
              <p className="metric-note">{note}</p>
            </motion.article>
          ))}
        </div>
      </section>
      <div className="chart-grid">
        <section className="panel chart-card" aria-labelledby="volume-title">
          <h2 id="volume-title">Volume por mês da oferta</h2>
          <p className="muted">Quilogramas ofertados e entregues · dados simulados</p>
          {data.offered === 0 ? <div className="empty-state chart-empty"><p>Sem ofertas no período selecionado.</p></div> : (
            <div className="volume-chart" aria-hidden="true">
              <div className="axis">{axis.map((tick) => <span key={tick}>{formatNumber(tick)}</span>)}</div>
              <div className="plot">
                <div className="grid-lines">{axis.map((tick) => <span key={tick} />)}</div>
                <div className="bars">
                  {data.months.map(({ month, offered, delivered }) => (
                    <div className="bar-group" key={month}>
                      {(['offered', 'delivered'] as const).map((kind) => (
                        <motion.div key={kind} className={`bar ${kind}`} initial={reduced ? false : { height: 0 }}
                          animate={{ height: `${(kind === 'offered' ? offered : delivered) / (4 * step) * 100}%` }}
                          transition={{ duration: reduced ? 0 : 0.32 }} />
                      ))}
                      <span>{formatMonth(month)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="chart-key" aria-hidden="true"><span><i className="offered" /> Ofertado</span><span><i className="delivered" /> Entregue</span></div>
          <details className="chart-details">
            <summary>Consultar valores mensais</summary>
            <table className="data-table volume-table" aria-labelledby={chartId}>
              <caption id={chartId} className="sr-only">Valores mensais simulados em quilogramas</caption>
              <thead><tr><th scope="col">Mês</th><th scope="col">Ofertado (kg)</th><th scope="col">Entregue (kg)</th></tr></thead>
              <tbody>{data.months.map(({ month, offered, delivered }) => <tr key={month}><th scope="row">{formatMonth(month)}</th><td>{formatNumber(offered)}</td><td>{formatNumber(delivered)}</td></tr>)}</tbody>
            </table>
          </details>
        </section>
        <section className="panel chart-card" aria-labelledby="category-title">
          <h2 id="category-title">Perfil das entregas</h2>
          <p className="muted">Participação no peso entregue · dados simulados</p>
          {data.delivered === 0 ? <div className="empty-state chart-empty"><p>Sem entregas vinculadas às ofertas do período.</p></div> : (
            <>
              <motion.div className="donut" style={{ background: `conic-gradient(${gradient})` }} aria-hidden="true"
                key={gradient} initial={reduced ? false : { opacity: 0.6, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
                <div><strong>{formatNumber(data.delivered)}</strong><span>kg entregues</span></div>
              </motion.div>
              <ul className="category-key">
                {shares.map(({ category, weight, value, color }) => (
                  <li key={category}><i style={{ backgroundColor: color }} aria-hidden="true" /><span>{category}</span><strong>{formatNumber(weight)} kg · {formatNumber(value)}%</strong></li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </>
  )
}
