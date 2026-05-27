import { Joyride, ACTIONS, EVENTS, STATUS } from 'react-joyride'
import type { EventData, Controls } from 'react-joyride'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@/hooks/useOnboarding'
import { tourStepsByRole } from './tourSteps'
import './joyride-custom.css'

/** Aguarda elemento aparecer no DOM via MutationObserver. */
function waitForElement(selector: string, timeout = 6000): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) { resolve(true); return }
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect()
        clearTimeout(timer)
        resolve(true)
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const timer = setTimeout(() => { observer.disconnect(); resolve(false) }, timeout)
  })
}

export function OnboardingTour() {
  const navigate = useNavigate()
  const { run, stepIndex, role, setStepIndex, finishTour } = useOnboardingStore()

  const steps = tourStepsByRole[role ?? 'cliente'] ?? tourStepsByRole['cliente']

  const handleEvent = async (data: EventData, _controls: Controls) => {
    const { action, index, status, type } = data

    // Tour finalizado ou pulado
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      finishTour()
      return
    }

    // Botão fechar
    if (action === ACTIONS.CLOSE) {
      finishTour()
      return
    }

    // Avanço de step (Próximo)
    if (type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT) {
      const nextIndex = index + 1
      const nextStep = steps[nextIndex]

      if (nextStep?.data?.navigate) {
        // Navega para a rota do próximo step
        navigate(nextStep.data.navigate)
        // Aguarda o elemento alvo aparecer no DOM
        const selector = nextStep.target as string
        if (selector && selector !== 'body') {
          await waitForElement(selector)
        }
      }

      setStepIndex(nextIndex)
      return
    }

    // Retrocesso de step (Anterior)
    if (type === EVENTS.STEP_AFTER && action === ACTIONS.PREV) {
      const prevIndex = index - 1
      const prevStep = steps[prevIndex]

      if (prevStep?.data?.navigate) {
        navigate(prevStep.data.navigate)
        const selector = prevStep.target as string
        if (selector && selector !== 'body') {
          await waitForElement(selector)
        }
      }

      setStepIndex(prevIndex)
    }
  }

  if (!run || steps.length === 0) return null

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      locale={{
        next: 'Próximo →',
        back: '← Anterior',
        last: 'Entendi! 🎉',
        skip: 'Pular tour',
        close: 'Fechar',
      }}
      options={{
        // Comportamento (eram props de topo na v2)
        showProgress: true,
        buttons: ['back', 'close', 'primary', 'skip'],
        skipBeacon: true,
        blockTargetInteraction: true,
        // Cores (eram styles.options na v2)
        primaryColor: '#2563eb',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        overlayColor: 'rgba(0, 0, 0, 0.55)',
        arrowColor: '#ffffff',
        zIndex: 10000,
      }}
    />
  )
}
