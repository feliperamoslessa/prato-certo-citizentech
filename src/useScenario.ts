import { useState } from 'react'
import { createScenario, receivers } from './mock'
import type { Lot } from './model'
import { decodeScenario, encodeScenario, storageKey } from './scenarioStorage'

function loadScenario() {
  try {
    const stored = window.localStorage.getItem(storageKey)
    if (stored !== null) return { lots: decodeScenario(stored, receivers), enabled: true, error: '' }
    return { lots: createScenario(), enabled: false, error: '' }
  } catch {
    return { lots: createScenario(), enabled: false, error: 'Os dados salvos não puderam ser lidos. O cenário de demonstração foi carregado em memória.' }
  }
}

export function useScenario() {
  const [state, setState] = useState(loadScenario)

  function commit(lots: Lot[], enabled = state.enabled) {
    try {
      if (enabled) window.localStorage.setItem(storageKey, encodeScenario(lots))
      else if (state.enabled) window.localStorage.removeItem(storageKey)
      setState({ lots, enabled, error: '' })
      return true
    } catch {
      setState({ ...state, error: 'Não foi possível atualizar o armazenamento deste navegador. A alteração não foi aplicada.' })
      return false
    }
  }

  function restore() {
    if (state.enabled) return commit(createScenario())
    try {
      window.localStorage.removeItem(storageKey)
      setState({ lots: createScenario(), enabled: false, error: '' })
      return true
    } catch {
      setState({ lots: createScenario(), enabled: false, error: 'O cenário em memória foi restaurado. O navegador bloqueou a limpeza do armazenamento.' })
      return false
    }
  }

  return { ...state, commit, restore }
}
