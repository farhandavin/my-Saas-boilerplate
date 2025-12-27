// components/RBACWrapper.jsx (Frontend)
'use client';
import React from 'react';
import { useAuth } from '../hooks/useAuth'; // Asumsi context provider

const RBACWrapper = ({ allowedRoles, children, fallback = null }) => {
  const { user } = useAuth(); // Data user dari login (isinya: id, role, tier)

  console.log(`[DEBUG UI] Checking access for Role: ${user?.role}`);

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback;
  }

  return <>{children}</>;
};

export default RBACWrapper;

// Contoh penggunaan di Dashboard
// <RBACWrapper allowedRoles={['OWNER', 'ADMIN']}>
//    <button className="bg-blue-500">Tombol Upgrade Tier (Hanya Owner/Admin)</button>
// </RBACWrapper>