'use client';

import { useEffect, useState } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TourStep {
  target: string; // CSS selector
  content: string;
  title: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  autoStart?: boolean;
}

export function GuidedTour({ steps, onComplete, autoStart = false }: GuidedTourProps) {
  const [isActive, setIsActive] = useState(autoStart);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isActive || currentStep >= steps.length) return;

    const updatePosition = () => {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        setPosition({
          top: rect.top + scrollTop + rect.height + 10,
          left: rect.left + scrollLeft,
        });

        // Scroll target into view
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    setCurrentStep(0);
    onComplete?.();
  };

  const handleComplete = () => {
    setIsActive(false);
    setCurrentStep(0);
    onComplete?.();
  };

  if (!isActive) {
    return (
      <Button
        onClick={() => setIsActive(true)}
        variant="outline"
        className="fixed bottom-6 right-6 z-50 shadow-lg"
      >
        🎯 Start Tour
      </Button>
    );
  }

  const currentStepData = steps[currentStep];
  const targetElement = document.querySelector(currentStepData.target);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm">
        {/* Spotlight on target element */}
        {targetElement && (
          <div
            className="absolute border-4 border-blue-500 rounded-lg transition-all duration-300 pointer-events-none"
            style={{
              top: targetElement.getBoundingClientRect().top - 4,
              left: targetElement.getBoundingClientRect().left - 4,
              width: targetElement.getBoundingClientRect().width + 8,
              height: targetElement.getBoundingClientRect().height + 8,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            }}
          />
        )}
      </div>

      {/* Tour card */}
      <div
        className="fixed z-50 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-blue-500 p-6 transition-all duration-300"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-semibold text-blue-600">
                Step {currentStep + 1} of {steps.length}
              </span>
              <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{currentStepData.title}</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSkip} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <p className="text-gray-700 dark:text-gray-300 mb-6">{currentStepData.content}</p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tour
          </Button>
          <Button onClick={handleNext} className="gap-2">
            {currentStep < steps.length - 1 ? (
              <>
                Next <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Complete <Check className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
