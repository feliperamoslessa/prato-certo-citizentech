import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion'

export const pitchId = 'PratoCerto'
export const pitchFps = 30
export const pitchWidth = 1920
export const pitchHeight = 1080
const beats = [
  { seconds: 6, label: 'CITIZENTECH PRATO CERTO', title: 'Tecnologia que alimenta conexões.', description: 'Uma proposta para conectar excedentes alimentares e organizações receptoras.', words: ['São Paulo, SP', 'Protótipo acadêmico'] },
  { seconds: 7, label: 'O DESAFIO', title: 'O tempo para aproveitar um excedente é curto.', description: 'Informação dispersa e desafios de coleta podem impedir que alimentos disponíveis cheguem a quem pode distribuí-los.', words: ['Disponibilidade', 'Prazo', 'Logística'] },
  { seconds: 7, label: 'CADASTRO DE EXCEDENTES', title: 'Cada lote começa com informações claras.', description: 'O cadastro registra peso, validade e conservação. A aptidão sanitária exige avaliação humana por profissional habilitado.', words: ['Peso', 'Validade', 'Conservação'] },
  { seconds: 6, label: 'ACOMPANHAMENTO', title: 'Da oferta à entrega confirmada.', description: 'Instituições fictícias e filtros por status demonstram o fluxo de doações.', words: ['Ofertado', 'Aceito', 'Retirado', 'Entregue'] },
  { seconds: 7, label: 'INDICADORES SIMULADOS', title: 'Acompanhar o impacto começa com medir.', description: 'O painel demonstra como acompanhar peso entregue, lotes concluídos e taxa de aproveitamento.', words: ['Quilos entregues', 'Lotes concluídos', 'Taxa de aproveitamento'] },
  { seconds: 5, label: 'ODS 2 E 12', title: 'Prato Certo.', description: 'Tecnologia que alimenta conexões.', words: ['FIAP', 'Global Solution'] },
]
export const pitchDuration = beats.reduce((sum, beat) => sum + beat.seconds * pitchFps, 0)

function Beat({ beat, index }: { beat: (typeof beats)[number]; index: number }) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const dark = index % 2 === 0 || index === beats.length - 1
  const entrance = spring({ frame, fps, config: { damping: 23, stiffness: 90 } })
  const opacity = interpolate(frame, [0, 12, durationInFrames - 12, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <AbsoluteFill style={{
      backgroundColor: dark ? '#204B3B' : '#F5F0E6',
      color: dark ? '#F5F0E6' : '#204B3B',
      padding: '102px 132px',
      fontFamily: 'Segoe UI, sans-serif',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', width: 850, height: 850, right: -170, top: -200,
        borderRadius: '50%', background: 'repeating-radial-gradient(circle, transparent 0 42px, #e8914563 43px 45px, transparent 46px 63px)', opacity: 0.6,
      }} />
      <div style={{ opacity, transform: `translateY(${(1 - entrance) * 44}px)`, maxWidth: 1450 }}>
        <div style={{ fontSize: 26, fontWeight: 750, letterSpacing: 5, color: dark ? '#ffc89c' : '#7f481f' }}>{beat.label}</div>
        <div style={{ marginTop: 24, fontFamily: 'Georgia, serif', lineHeight: 1.02, letterSpacing: -5, fontSize: 104 }}>{beat.title}</div>
        <div style={{ marginTop: 29, fontSize: 38, lineHeight: 1.35, maxWidth: 1160 }}>{beat.description}</div>
        <div style={{ marginTop: 44, display: 'flex', gap: 17 }}>
          {beat.words.map((word, item) => (
            <div key={word} style={{
              padding: '12px 24px', borderRadius: 32, backgroundColor: dark ? '#f0a361' : '#204B3B',
              color: dark ? '#29342E' : '#F5F0E6', fontSize: 25, fontWeight: 700,
              opacity: interpolate(frame - item * 5, [10, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}>{word}</div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 72, left: 132, right: 132, display: 'flex', gap: 8 }}>
        {beats.map((part, step) => (
          <div key={part.label} style={{ flex: part.seconds, backgroundColor: dark ? '#9bb29e' : '#a5b7a8', height: 5, borderRadius: 3 }}>
            <div style={{ width: `${step < index ? 100 : step === index ? 100 * frame / (durationInFrames - 1) : 0}%`, height: '100%', borderRadius: 3, background: dark ? '#ffc89c' : '#204b3b' }} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  )
}

export function Pitch() {
  let from = 0
  return (
    <AbsoluteFill style={{ backgroundColor: '#204B3B' }}>
      {beats.map((beat, index) => {
        const duration = beat.seconds * pitchFps
        const start = from
        from += duration
        return (
          <Sequence key={beat.label} name={beat.label} from={start} durationInFrames={duration}>
            <Beat beat={beat} index={index} />
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}
