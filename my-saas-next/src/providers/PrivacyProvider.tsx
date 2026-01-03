'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type PrivacyContextType = {
  isBlurred: boolean;
  togglePrivacy: () => void;
};

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isBlurred, setIsBlurred] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('privacy_blur');
    if (stored === 'true') setIsBlurred(true);
  }, []);

  const togglePrivacy = () => {
    const newState = !isBlurred;
    setIsBlurred(newState);
    localStorage.setItem('privacy_blur', String(newState));
  };

  return (
    <PrivacyContext.Provider value={{ isBlurred, togglePrivacy }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}
