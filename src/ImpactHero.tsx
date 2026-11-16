import { Component, lazy, Suspense, useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { ArrowUpRight, Leaf } from 'lucide-react'
import { gsap } from 'gsap'
import { useReducedMotion } from 'motion/react'

const HeroScene = lazy(() => import('./HeroScene'))

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function ImpactHero() {
  const hero = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced !== false) return
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { duration: 0.62, ease: 'power3.out' } })
        .from('.hero-copy > *', { y: 16, opacity: 0, stagger: 0.11 })
        .from('.hero-art', { opacity: 0, scale: 0.94 }, 0.18)
        .from('.hero-action', { y: 8, opacity: 0 }, 0.32)
    }, hero)
    return () => context.revert()
  }, [reduced])

  return (
    <section className="impact-hero" ref={hero}>
      <div className="hero-copy">
        <p className="eyebrow"><Leaf size={15} aria-hidden="true" /> IMPACTO SOCIAL · SÃO PAULO, SP</p>
        <h2>Tecnologia que alimenta<br className="hero-break" /> conexões.</h2>
        <p>Acompanhe o aproveitamento de excedentes alimentares e o fluxo de doações em um cenário simulado.</p>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="plate-fallback"><i /><i /><i /></div>
        {reduced === false && (
          <div className="hero-canvas">
            <SceneBoundary><Suspense fallback={null}><HeroScene /></Suspense></SceneBoundary>
          </div>
        )}
      </div>
      <a className="button hero-action" href="#excedentes">Cadastrar excedente <ArrowUpRight size={17} aria-hidden="true" /></a>
    </section>
  )
}
