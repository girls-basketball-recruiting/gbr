'use client'

import { Check } from 'lucide-react'

interface Step {
  id: number
  name: string
  description?: string
}

interface FormStepperProps {
  steps: Step[]
  currentStep: number
}

export function FormStepper({ steps, currentStep }: FormStepperProps) {
  return (
    <nav aria-label='Progress'>
      <ol className='flex items-center justify-between w-full mb-8'>
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isComplete = currentStep > stepNumber
          const isCurrent = currentStep === stepNumber
          const isUpcoming = currentStep < stepNumber

          return (
            <li
              key={step.id}
              className={`flex items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className='flex flex-col items-center'>
                {/* Step indicator */}
                <div className='flex items-center'>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      isComplete
                        ? 'bg-blue-600 border-blue-600'
                        : isCurrent
                          ? 'border-blue-600 bg-white dark:bg-slate-900'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {isComplete ? (
                      <Check className='w-5 h-5 text-white' />
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          isCurrent
                            ? 'text-blue-600'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {stepNumber}
                      </span>
                    )}
                  </div>

                  {/* Connector line */}
                  {index !== steps.length - 1 && (
                    <div
                      className={`h-0.5 w-full min-w-[2rem] mx-2 transition-all ${
                        isComplete
                          ? 'bg-blue-600'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                  )}
                </div>

                {/* Step label */}
                <div className='mt-2 text-center'>
                  <p
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-blue-600'
                        : isComplete
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.name}
                  </p>
                  {step.description && (
                    <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block'>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
