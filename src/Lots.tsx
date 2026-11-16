import { useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ArrowRight, CircleAlert, ClipboardList, ListFilter, PackageOpen, ShieldCheck } from 'lucide-react'
import { receivers } from './mock'
import { categories, filterDonations, formatDate, formatNumber, statuses, storageOptions, validateLot } from './model'
import type { Donation, LotInput } from './model'

export function LotForm({ onRegister }: { onRegister: (input: LotInput) => void }) {

  const [errors, setErrors] = useState<ReturnType<typeof validateLot>>({})
  const [failure, setFailure] = useState('')
  const form = useRef<HTMLFormElement>(null)

  function clearError(field: keyof LotInput) {

    setFailure('')
    if (errors[field]) setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const input: LotInput = {
      category: String(data.get('category') ?? ''),
      weight: String(data.get('weight') ?? ''),
      expires: String(data.get('expires') ?? ''),
      storage: String(data.get('storage') ?? ''),
    }
    const validation = validateLot(input)
    setErrors(validation)
    const firstInvalid = Object.keys(validation)[0]
    if (firstInvalid) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>(`#${firstInvalid}`)?.focus())
      return
    }
    try {
      onRegister(input)
    } catch {
      setFailure('O lote não pôde ser cadastrado. Revise a validade e tente novamente.')
    }
  }

  function field(name: keyof LotInput, label: string, control: ReactNode, hint?: string) {
    return (
      <div className="field">
        <label htmlFor={name}>{label}</label>
        {control}
        {hint && <p className="muted" id={`${name}-hint`}>{hint}</p>}
        {errors[name] && <p className="field-error" id={`${name}-error`}>{errors[name]}</p>}
      </div>
    )
  }

  function attributes(name: keyof LotInput, hint?: boolean) {
    return {
      id: name,
      name,
      required: true,
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby': [hint && `${name}-hint`, errors[name] && `${name}-error`].filter(Boolean).join(' ') || undefined,
    }
  }

  return (
    <div className="form-layout">
      <section className="panel form-card" aria-labelledby="lot-title">
        <div className="section-heading"><div><h2 id="lot-title">Dados do lote</h2><p>Todos os campos são obrigatórios.</p></div><span className="metric-icon"><ClipboardList size={20} /></span></div>
        <form ref={form} onSubmit={submit} noValidate className="lot-form">
          {(failure || Object.values(errors).some(Boolean)) && (
            <p className="error-banner" role="alert"><CircleAlert size={18} />{failure || 'Revise os campos indicados antes de cadastrar.'}</p>
          )}
          <div className="form-grid">
            {field('category', 'Tipo de alimento',
              <select {...attributes('category')} onChange={() => clearError('category')}>
                <option value="">Selecione o tipo</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>)}
            {field('weight', 'Peso (kg)',
              <input {...attributes('weight', true)} inputMode="decimal" onChange={() => clearError('weight')} placeholder="Ex. 12,5" />,
              'Use até duas casas decimais.')}
            {field('expires', 'Validade',
              <input {...attributes('expires', true)} type="datetime-local" onChange={() => clearError('expires')} />,
              'Data e hora no fuso deste dispositivo.')}
            {field('storage', 'Condição de armazenamento',
              <select {...attributes('storage')} onChange={() => clearError('storage')}>
                <option value="">Selecione a condição</option>
                {storageOptions.map((option) => <option key={option}>{option}</option>)}
              </select>)}
          </div>
          <div className="form-actions">
            <a href="#doacoes" className="button secondary">Ver acompanhamento</a>
            <button className="button primary" type="submit">Registrar lote <ArrowRight size={17} /></button>
          </div>
        </form>
      </section>
      <aside className="panel safety-card" aria-labelledby="safety-title">
        <span className="metric-icon"><ShieldCheck size={22} /></span>
        <h2 id="safety-title">Verificação sanitária</h2>
        <p>A aptidão para doação exige avaliação humana por profissional habilitado.</p>
        <p>O lote é registrado como <strong>Verificação pendente</strong> e fica indisponível para oferta.</p>
        <p>Use apenas informações fictícias nesta demonstração.</p>
      </aside>
    </div>
  )
}

export function Donations({ donations, notice, dismissNotice }: { donations: Donation[]; notice: string; dismissNotice: () => void }) {
  const [status, setStatus] = useState('')
  const [receiver, setReceiver] = useState('')
  const filtered = filterDonations(donations, status, receiver)

  function clear() {
    setStatus('')
    setReceiver('')
  }

  return (
    <div className="space-y-5">
      {notice && <div className="success-banner" role="status"><ShieldCheck size={20} /><span>{notice}</span><button onClick={dismissNotice} className="text-button">Dispensar</button></div>}
      <section className="panel tracking-card" aria-labelledby="tracking-title">
        <div className="section-heading tracking-heading">
          <div><h2 id="tracking-title">Lotes e doações</h2><p>Fluxo simulado com instituições fictícias.</p></div>
          <span className="metric-icon"><ListFilter size={20} /></span>
        </div>
        <div className="filters">
          <label className="field">Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {Object.entries(statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label className="field">Instituição receptora
            <select value={receiver} onChange={(e) => setReceiver(e.target.value)}>
              <option value="">Todas as instituições</option>
              {receivers.map((name) => <option key={name}>{name}</option>)}
            </select>
          </label>
          {(status || receiver) && <button className="button secondary" onClick={clear}>Limpar filtros</button>}
        </div>
        <p className="result-count" role="status">{filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}</p>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <PackageOpen size={30} aria-hidden="true" />
            <h3>Nenhum lote encontrado</h3>
            <p>{status || receiver ? 'Ajuste os filtros para consultar outros registros.' : 'Cadastre um excedente para começar.'}</p>
            {status || receiver ? <button className="button secondary" onClick={clear}>Mostrar todos os lotes</button> : <a className="button primary" href="#excedentes">Cadastrar excedente</a>}
          </div>
        ) : (
          <ul className="donation-list">
            {filtered.map((donation) => (
              <li key={donation.id}>
                <div className="donation-item"><div><span className="lot-id">{donation.id}</span><h3>{donation.category}</h3></div><span className={`status status-${donation.status}`}>{statuses[donation.status]}</span></div>
                <dl className="donation-info">
                  <div><dt>Peso</dt><dd>{formatNumber(donation.weight)} kg</dd></div>
                  <div><dt>Validade</dt><dd>{formatDate(new Date(donation.expires))}</dd></div>
                  <div><dt>Armazenamento</dt><dd>{donation.storage}</dd></div>
                  <div><dt>Instituição receptora</dt><dd>{donation.receiver ?? 'Aguardando verificação'}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
