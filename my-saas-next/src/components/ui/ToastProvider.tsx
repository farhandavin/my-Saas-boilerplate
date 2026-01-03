'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';

// Export Toast Provider Component
export function ToastProvider() {
  return (
    <SonnerToaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
        },
        className: 'shadow-lg',
      }}
    />
  );
}

// Export toast utilities for easy usage
export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4500,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },

  // Special toasts for specific scenarios
  accessDenied: () => {
    toast.error('Akses Ditolak', {
      description: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
      duration: 5000,
    });
  },

  tierLimitReached: () => {
    toast.warning('Batas Tier Tercapai', {
      description: 'Upgrade paket Anda untuk mengakses fitur ini.',
      duration: 6000,
      action: {
        label: 'Upgrade',
        onClick: () => window.location.href = '/billing',
      },
    });
  },

  aiTimeout: () => {
    toast.info('AI Sedang Sibuk', {
      description: 'Silakan coba lagi dalam beberapa detik.',
      duration: 5000,
    });
  },

  migrationInProgress: () => {
    toast.loading('Migrasi Sedang Berlangsung', {
      description: 'Data Anda sedang dipindahkan. Harap tunggu...',
    });
  },

  sessionExpired: () => {
    toast.error('Sesi Berakhir', {
      description: 'Silakan login kembali untuk melanjutkan.',
      duration: 5000,
    });
  },
};

// Re-export raw toast for advanced usage
export { toast };
