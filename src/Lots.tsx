import { useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ArrowRight, CircleAlert, ClipboardList, ShieldCheck } from 'lucide-react'
import { categories, storageOptions, validateLot } from './model'
import type { LotInput } from './model'

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
    } catch (error) {
      setFailure(error instanceof Error ? error.message : 'O lote não pôde ser cadastrado.')
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
