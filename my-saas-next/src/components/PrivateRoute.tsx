'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.push('/auth');
        }
      } catch (error) {
        router.push('/auth');
      }
    };
    checkAuth();
  }, [router]);

  // Wait for auth check
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;