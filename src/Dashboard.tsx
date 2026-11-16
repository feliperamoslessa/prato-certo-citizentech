import { lazy, Suspense, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ImpactHero } from './ImpactHero'
import { Box, ChartNoAxesColumnIncreasing, HandHeart, Play, Scale } from 'lucide-react'
import { categoryShare, monthlyImpact } from './mock'
import { formatNumber } from './model'

const PitchPlayer = lazy(() => import('./PitchPlayer'))

const axis = [400, 300, 200, 100, 0]

let offset = 0
const segments = categoryShare.map(({ value, color }) => {
  const start = offset
  offset += value
  return `${color} ${start}% ${offset}%`
}).join(', ')

export function Dashboard() {
  const reduceMotion = useReducedMotion()
  const [showPitch, setShowPitch] = useState(false)
  const [period, setPeriod] = useState('6')
  const data = monthlyImpact.slice(-Number(period))
  const delivered = data.reduce((total, point) => total + point.delivered, 0)
  const offered = data.reduce((total, point) => total + point.offered, 0)
  const lots = data.reduce((total, point) => total + point.lots, 0)
  const metrics = [
    { name: 'Alimentos entregues', value: formatNumber(delivered), unit: 'kg', note: 'Peso com entrega confirmada', icon: Scale },
    { name: 'Lotes entregues', value: formatNumber(lots), note: 'Doações concluídas no período', icon: Box },
    { name: 'Taxa de aproveitamento', value: formatNumber(Math.round(100 * delivered / offered)), unit: '%', note: 'Peso entregue ÷ elegível ofertado', icon: ChartNoAxesColumnIncreasing },
    { name: 'Instituições atendidas', value: formatNumber(data.at(-1)!.active), note: 'Instituições fictícias no último mês', icon: HandHeart },
  ]

  return (
    <>
      <ImpactHero />

      <section aria-labelledby="indicators" className="space-y-4">
        <div className="section-heading">
          <div>
            <h2 id="indicators">Indicadores de impacto</h2>
            <p>Métricas simuladas · 2026</p>
          </div>
          <label className="period">
            <span className="sr-only">Período dos indicadores</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="6">Mai–Out de 2026</option>
              <option value="3">Ago–Out de 2026</option>
            </select>
          </label>
        </div>
        <div className="metrics-grid">
          {metrics.map(({ name, value, unit, note, icon: Icon }, index) => (
            <motion.article
              className="panel metric"
              key={name}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={reduceMotion ? undefined : { y: -3 }}
              transition={{ duration: 0.25, opacity: { delay: index * 0.055 } }}
            >
              <div className="metric-icon"><Icon size={20} aria-hidden="true" /></div>
              <h3>{name}</h3>
              <p className="metric-value">{value}<span>{unit}</span></p>
              <p className="metric-note">{note}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <div className="chart-grid">
        <section className="panel chart-card" aria-labelledby="volume-title">
          <h2 id="volume-title">Volume de alimentos</h2>
          <p className="muted">Peso mensal simulado em quilogramas</p>
          <figure className="volume-chart">
            <div className="axis" aria-hidden="true">{axis.map((tick) => <span key={tick}>{tick}</span>)}</div>
            <div className="plot" aria-hidden="true">
              <div className="grid-lines">{axis.map((tick) => <span key={tick} />)}</div>
              <div className="bars">
                {data.map(({ month, offered, delivered }) => (
                  <div className="bar-group" key={month}>
                    <motion.div className="bar offered" initial={false} transition={{ duration: reduceMotion ? 0 : 0.35 }} animate={{ height: `${offered / 4}%` }} title={`${month} · Ofertado: ${offered} kg`} />
                    <motion.div className="bar delivered" initial={false} transition={{ duration: reduceMotion ? 0 : 0.35 }} animate={{ height: `${delivered / 4}%` }} title={`${month} · Entregue: ${delivered} kg`} />
                    <span>{month}</span>
                  </div>
                ))}
              </div>
            </div>
            <table className="sr-only">
              <caption>Volume mensal simulado em quilogramas</caption>
              <thead><tr><th scope="col">Mês</th><th scope="col">Elegível ofertado</th><th scope="col">Entregue</th></tr></thead>
              <tbody>{data.map(({ month, offered, delivered }) => <tr key={month}><th scope="row">{month}</th><td>{offered}</td><td>{delivered}</td></tr>)}</tbody>
            </table>
          </figure>
          <div className="chart-key"><span><i className="offered" /> Elegível ofertado</span><span><i className="delivered" /> Entregue</span></div>
          <details className="chart-details">
            <summary>Consultar valores mensais</summary>
            <ul>{data.map(({ month, offered, delivered }) => <li key={month}>{month} · {offered} kg ofertados · {delivered} kg entregues</li>)}</ul>
          </details>
        </section>
        <section className="panel chart-card" aria-labelledby="category-title">
          <h2 id="category-title">Perfil das doações</h2>
          <p className="muted">Distribuição simulada por peso · Mai–Out de 2026</p>
          <div className="donut" style={{ background: `conic-gradient(${segments})` }} aria-hidden="true">
            <div><strong>4</strong><span>categorias</span></div>
          </div>
          <ul className="category-key">
            {categoryShare.map(({ label, value, color }) => (
              <li key={label}><i style={{ backgroundColor: color }} /><span>{label}</span><strong>{value}%</strong></li>
            ))}
          </ul>
        </section>
      </div>
      <section className="panel pitch-card" aria-labelledby="pitch-title">
        <div className="section-heading">
          <div>
            <h2 id="pitch-title">Pitch do Prato Certo</h2>
            <p>Apresentação curta da proposta em 38 segundos, com texto na tela.</p>
          </div>
          <button type="button" className="button primary" aria-expanded={showPitch} aria-controls="pitch-preview" onClick={() => setShowPitch(!showPitch)}>
            <Play size={16} aria-hidden="true" /> {showPitch ? 'Fechar vídeo' : 'Abrir vídeo'}
          </button>
        </div>
        <div id="pitch-preview" hidden={!showPitch}>
          {showPitch && <Suspense fallback={<p role="status">Carregando vídeo…</p>}><PitchPlayer /></Suspense>}
        </div>
      </section>
    </>
  )
}
