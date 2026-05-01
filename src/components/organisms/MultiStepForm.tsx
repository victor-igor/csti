import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Step {
  title: string
  component: React.ReactNode
}

interface MultiStepFormProps {
  steps: Step[]
  onComplete: () => void
}

function StepContent({
  step,
  currentIndex,
  total,
  onNext,
  onBack,
  onComplete,
  fields,
}: {
  step: Step
  currentIndex: number
  total: number
  onNext: () => void
  onBack: () => void
  onComplete: () => void
  fields?: string[]
}) {
  const isLast = currentIndex === total - 1
  const isFirst = currentIndex === 0

  const methods = useFormContext()

  async function handleNext() {
    if (methods && fields && fields.length > 0) {
      const valid = await methods.trigger(fields)
      if (!valid) return
    }
    if (isLast) {
      onComplete()
    } else {
      onNext()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {step.component}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} disabled={isFirst}>
          Voltar
        </Button>
        <Button onClick={handleNext}>{isLast ? 'Concluir' : 'Próximo'}</Button>
      </div>
    </div>
  )
}

export function MultiStepForm({ steps, onComplete }: MultiStepFormProps) {
  const [current, setCurrent] = useState(0)

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                i < current
                  ? 'bg-primary text-primary-foreground'
                  : i === current
                    ? 'border-2 border-primary bg-background text-primary'
                    : 'border border-border bg-background text-muted-foreground',
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                'text-xs text-center',
                i === current ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.title}
            </span>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'absolute mt-4 h-0.5 w-full',
                  i < current ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </div>
        ))}
      </div>

      <StepContent
        step={steps[current]}
        currentIndex={current}
        total={steps.length}
        onNext={() => setCurrent((c) => c + 1)}
        onBack={() => setCurrent((c) => c - 1)}
        onComplete={onComplete}
      />
    </div>
  )
}
