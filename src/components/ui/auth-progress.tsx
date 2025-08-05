'use client';

import { cn } from '@/lib/utils';

interface AuthProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function AuthProgress({ currentStep, totalSteps, steps }: AuthProgressProps) {
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border-2",
                  index < currentStep
                    ? "bg-blue-600 border-blue-600 text-white shadow-md"
                    : index === currentStep
                    ? "bg-white border-blue-600 text-blue-600 shadow-lg ring-4 ring-blue-100"
                    : "bg-gray-100 border-gray-300 text-gray-400"
                )}
              >
                {index < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium mt-2 transition-colors duration-300",
                  index <= currentStep ? "text-blue-600" : "text-gray-400"
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 h-0.5 rounded">
                <div
                  className={cn(
                    "h-full rounded transition-all duration-500",
                    index < currentStep ? "bg-blue-600" : "bg-gray-200"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
