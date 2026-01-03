'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const DASHBOARD_TOUR: TourStep[] = [
  {
    target: '[data-tour="sidebar"]',
    title: 'Navigation Sidebar',
    content: 'Use the sidebar to navigate between different sections of your dashboard.',
    placement: 'right'
  },
  {
    target: '[data-tour="ai-hub"]',
    title: 'AI Hub',
    content: 'Access powerful AI features including CEO Digest and Document Pre-Check.',
    placement: 'right'
  },
  {
    target: '[data-tour="team"]',
    title: 'Team Management',
    content: 'Invite members, manage roles, and configure your team settings.',
    placement: 'right'
  },
  {
    target: '[data-tour="quick-actions"]',
    title: 'Quick Actions',
    content: 'Common actions are available here for fast access.',
    placement: 'bottom'
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const step = DASHBOARD_TOUR[currentStep];
    const el = document.querySelector(step.target);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < DASHBOARD_TOUR.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboarding_completed', 'true');
      onComplete();
    }
  };

  const skipTour = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  if (!mounted) return null;

  const step = DASHBOARD_TOUR[currentStep];

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Spotlight */}
      {targetRect && (
        <div
          className="absolute bg-transparent border-4 border-indigo-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] transition-all duration-300"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16
          }}
        />
      )}

      {/* Tooltip */}
      {targetRect && (
        <div
          className="absolute bg-white dark:bg-[#1a2632] rounded-xl p-6 shadow-2xl max-w-sm animate-fade-in"
          style={{
            top: step.placement === 'bottom' ? targetRect.bottom + 16 : targetRect.top,
            left: step.placement === 'right' ? targetRect.right + 16 : targetRect.left
          }}
        >
          {/* Progress */}
          <div className="flex gap-1 mb-4">
            {DASHBOARD_TOUR.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i <= currentStep ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {step.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            {step.content}
          </p>

          <div className="flex justify-between items-center">
            <button
              onClick={skipTour}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Skip tour
            </button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900"
                >
                  Back
                </button>
              )}
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                {currentStep === DASHBOARD_TOUR.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

// Hook to use the tour
export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    if (!completed) {
      // Small delay to let dashboard render first
      setTimeout(() => setShowTour(true), 1500);
    }
  }, []);

  return {
    showTour,
    startTour: () => setShowTour(true),
    closeTour: () => setShowTour(false)
  };
}