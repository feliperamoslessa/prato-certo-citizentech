import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ChartNoAxesCombined, FlaskConical, HandHeart, Leaf, LoaderCircle, PackagePlus, Route, Sprout } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { Dashboard } from './Dashboard'
import { Donations } from './Donations'
import { LotForm } from './Lots'
import { receivers } from './mock'
import { advanceLot, offerLot, registerLot, statuses } from './model'
import type { EventStatus, Lot, LotInput } from './model'
import { useScenario } from './useScenario'

const Matching = lazy(() => import('./Matching'))

const views = {
  impacto: { label: 'Visão de impacto', title: 'Dashboard de impacto', subtitle: 'Acompanhe o aproveitamento de excedentes no cenário de demonstração.', icon: ChartNoAxesCombined },
  excedentes: { label: 'Cadastrar excedente', title: 'Cadastro de excedentes', subtitle: 'Registre um lote simulado para verificação sanitária.', icon: PackagePlus },
  matching: { label: 'Combinar lotes', title: 'Matching de doações', subtitle: 'Compare capacidade, prazo e distância antes de escolher uma instituição.', icon: Route },
  doacoes: { label: 'Acompanhar doações', title: 'Acompanhamento de doações', subtitle: 'Consulte lotes, instituições fictícias e etapas da doação.', icon: HandHeart },
} as const
type View = keyof typeof views
const viewKeys = Object.keys(views) as View[]

function getView(): View {
  return viewKeys.find((key) => key === window.location.hash.slice(1)) ?? 'impacto'
}

export default function App() {
  const reduced = useReducedMotion()
  const [view, setView] = useState(getView)
  const [now, setNow] = useState(Date.now)
  const [notice, setNotice] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const title = useRef<HTMLHeadingElement>(null)
  const resetButton = useRef<HTMLButtonElement>(null)
  const lastView = useRef(view)
  const scenario = useScenario()

  useEffect(() => {
    const onHashChange = () => { setView(getView()); setNow(Date.now()) }
    window.addEventListener('hashchange', onHashChange)
    const timer = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    document.title = `${views[view].title} | Prato Certo`
    if (lastView.current !== view) {
      title.current?.focus({ preventScroll: true })
      window.scrollTo(0, 0)
      lastView.current = view
    }
  }, [view])

  useEffect(() => {
    if (view !== 'impacto' || reduced !== false) return
    const lenis = new Lenis({ autoRaf: true, lerp: 0.12 })
    return () => lenis.destroy()
  }, [view, reduced])

  function update(lots: Lot[], message: string) {
    if (!scenario.commit(lots)) throw new Error('O navegador bloqueou a gravação. Revise a opção de armazenamento e tente novamente.')
    setNow(Date.now())
    setNotice(message)
  }

  function createLot(input: LotInput) {
    let number = scenario.lots.length + 1
    let id = `PC-${String(number).padStart(3, '0')}`
    while (scenario.lots.some((lot) => lot.id === id)) id = `PC-${String(++number).padStart(3, '0')}`
    const lot = registerLot(input, id)
    update([lot, ...scenario.lots], `${id} cadastrado. Aguardando verificação sanitária humana.`)
    window.location.hash = 'doacoes'
  }

  function changeLot(id: string, change: (lot: Lot) => Lot, message: string) {
    const lot = scenario.lots.find((record) => record.id === id)
    if (!lot) throw new Error('O lote não está disponível neste cenário.')
    const updated = change(lot)
    update(scenario.lots.map((record) => record.id === id ? updated : record), message)
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo" onClick={(event) => { event.preventDefault(); title.current?.focus() }}>Ir para o conteúdo</a>
      <aside className="sidebar">
        <a className="brand" href="#impacto" aria-label="Prato Certo, visão de impacto">
          <span className="brand-icon"><Sprout size={24} aria-hidden="true" /></span>
          <span><strong>Prato Certo<span>.</span></strong><small>CITIZENTECH</small></span>
        </a>
        <nav aria-label="Navegação principal">
          <p className="nav-label">PLATAFORMA</p>
          {viewKeys.map((key) => {
            const { label, icon: Icon } = views[key]
            return <a key={key} href={`#${key}`} aria-current={view === key ? 'page' : undefined} onClick={() => setNotice('')}>
              <Icon size={18} aria-hidden="true" /><span>{label}</span>
              {view === key && <motion.i className="nav-indicator" aria-hidden="true" layoutId={reduced ? undefined : 'active-view'} />}
            </a>
          })}
        </nav>
        <div className="sidebar-footer"><Leaf size={19} aria-hidden="true" /><div><strong>Projeto acadêmico</strong><small>FIAP · Global Solution</small></div></div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span><strong>{views[view].label}</strong></span>
          <span className="demo-label"><FlaskConical size={15} aria-hidden="true" /> Dados simulados</span>
        </header>
        <main id="conteudo" className="content">
          <header className="page-heading">
            <h1 ref={title} tabIndex={-1}>{views[view].title}</h1>
            <p>{views[view].subtitle}</p>
          </header>
          {scenario.error && <p className="error-banner" role="alert">{scenario.error}</p>}
          <div role="status" className={notice ? 'success-banner view-notice' : 'sr-only'}>{notice}</div>
          <motion.div key={view} initial={reduced ? false : { opacity: 0.72, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
            {view === 'impacto' && <Dashboard lots={scenario.lots} now={now} />}
            {view === 'excedentes' && <LotForm onRegister={createLot} />}
            {view === 'matching' && (
              <Suspense fallback={<div className="panel tracking-card loading-view" role="status"><LoaderCircle size={18} aria-hidden="true" /> Carregando recomendações…</div>}>
                <Matching lots={scenario.lots} receivers={receivers} now={now} onOffer={(id, receiverId) => {
                  changeLot(id, (lot) => offerLot(lot, receiverId, receivers, Date.now()), `Oferta simulada registrada para o lote ${id}.`)
                  window.location.hash = 'doacoes'
                }} />
              </Suspense>
            )}
            {view === 'doacoes' && <Donations lots={scenario.lots} receivers={receivers} now={now} onAdvance={(id: string, status: EventStatus) => {
              changeLot(id, (lot) => advanceLot(lot, status, Date.now()), `${id} · ${statuses[status]}. Etapa simulada registrada.`)
            }} />}
          </motion.div>
          <details className="panel scenario-panel">
            <summary>Cenário de demonstração</summary>
            <div className="scenario-controls">
              <label className="scenario-toggle"><input type="checkbox" checked={scenario.enabled} onChange={(event) => {
                const enabled = event.target.checked
                if (scenario.commit(scenario.lots, enabled)) setNotice(enabled ? 'Cenário salvo neste navegador.' : 'Cópia salva removida. O cenário atual segue em memória.')
              }} /> Manter dados simulados neste navegador</label>
              <p className="muted">Por padrão, os dados ficam em memória. Ative esta opção para continuar após recarregar.</p>
              <button ref={resetButton} type="button" className="button secondary" aria-expanded={confirmReset} aria-controls="reset-confirmation" onClick={() => setConfirmReset(!confirmReset)}>Restaurar cenário original</button>
              <div id="reset-confirmation" className="reset-confirmation" hidden={!confirmReset}>
                <p>Isso substitui os registros simulados atuais pelo cenário inicial.</p>
                <button type="button" className="button primary" onClick={() => {
                  if (scenario.restore()) setNotice('Cenário original restaurado.')
                  setNow(Date.now())
                  setConfirmReset(false)
                  resetButton.current?.focus()
                }}>Confirmar restauração</button>
              </div>
            </div>
          </details>
          <footer className="content-footer"><span>CitizenTech Prato Certo · v0.2</span><span>Protótipo acadêmico · Ambiente de demonstração</span></footer>
        </main>
      </div>
    </div>
  )
}
