import { useEffect, useRef, useState } from 'react'
import { ChartNoAxesCombined, ChevronRight, FlaskConical, HandHeart, Leaf, PackagePlus, Sprout } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { Dashboard } from './Dashboard'
import { Donations, LotForm } from './Lots'
import { donations } from './mock'
import { registerLot } from './model'
import type { LotInput } from './model'

const views = {
  impacto: { label: 'Visão de impacto', title: 'Dashboard de impacto', subtitle: 'Indicadores da demonstração acadêmica do Prato Certo.', icon: ChartNoAxesCombined },
  excedentes: { label: 'Cadastrar excedente', title: 'Cadastro de excedentes', subtitle: 'Registre um lote simulado para verificação sanitária.', icon: PackagePlus },
  doacoes: { label: 'Acompanhar doações', title: 'Acompanhamento de doações', subtitle: 'Consulte o status dos lotes e suas instituições receptoras.', icon: HandHeart },
} as const
type View = keyof typeof views
const viewKeys = Object.keys(views) as View[]

function getView(): View {
  const hash = window.location.hash.slice(1)
  return viewKeys.find((key) => key === hash) ?? 'impacto'
}

export default function App() {
  const reduceMotion = useReducedMotion()
  const [view, setView] = useState(getView)
  const [records, setRecords] = useState(donations)
  const [notice, setNotice] = useState('')
  const title = useRef<HTMLHeadingElement>(null)
  const lastView = useRef(view)

  useEffect(() => {
    const onHashChange = () => setView(getView())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    document.title = `${views[view].title} | Prato Certo`
    if (lastView.current !== view) {
      title.current?.focus()
      window.scrollTo(0, 0)
      lastView.current = view
    }
  }, [view])

  useEffect(() => {
    if (view !== 'impacto' || reduceMotion !== false) return
    const lenis = new Lenis({ autoRaf: true, lerp: 0.12 })
    return () => lenis.destroy()
  }, [view, reduceMotion])

  function createLot(input: LotInput) {
    const id = `PC-${String(records.length + 1).padStart(3, '0')}`
    const record = registerLot(input, id)
    setRecords((current) => [record, ...current])
    setNotice(`Lote ${id} cadastrado. Aguardando verificação sanitária humana.`)
    window.location.hash = 'doacoes'
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
            return <a key={key} href={`#${key}`} aria-current={view === key ? 'page' : undefined}><Icon size={19} aria-hidden="true" /><span>{label}</span>{view === key && <ChevronRight size={15} className="nav-arrow" aria-hidden="true" />}</a>
          })}
        </nav>
        <div className="sidebar-footer"><Leaf size={19} aria-hidden="true" /><div><strong>Projeto acadêmico</strong><small>FIAP · Global Solution</small></div></div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>Plataforma <ChevronRight size={14} aria-hidden="true" /> <strong>{views[view].label}</strong></span>
          <span className="demo-label"><FlaskConical size={15} aria-hidden="true" /> Dados simulados</span>
        </header>
        <main id="conteudo" className="content">
          <header className="page-heading">
            <h1 ref={title} tabIndex={-1}>{views[view].title}</h1>
            <p>{views[view].subtitle}</p>
          </header>
          <motion.div
            key={view}
            initial={view === 'impacto' || reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
          >
            {view === 'impacto' && <Dashboard />}
            {view === 'excedentes' && <LotForm onRegister={createLot} />}
            {view === 'doacoes' && <Donations donations={records} notice={notice} dismissNotice={() => setNotice('')} />}
          </motion.div>
          <footer className="content-footer"><span>CitizenTech Prato Certo</span><span>Protótipo acadêmico · Ambiente de demonstração</span></footer>
        </main>
      </div>
    </div>
  )
}
