'use client';

import React, { useState, useEffect } from 'react';
import { Role } from '@/types';

interface RBACWrapperProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RBACWrapper = ({ allowedRoles, children, fallback = null }: RBACWrapperProps) => {
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get role from localStorage (set during login)
    const role = localStorage.getItem('role') as Role;
    setUserRole(role);
    setLoading(false);
  }, []);

  // Show nothing while loading to prevent flash
  if (loading) return null;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RBACWrapper;

// Usage:
// <RBACWrapper allowedRoles={['ADMIN', 'MANAGER']}>
//    <button>Owner/Admin only button</button>
// </RBACWrapper>