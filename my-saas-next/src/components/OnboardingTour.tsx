// frontend/src/components/OnboardingTour.jsx
'use client';
import { useEffect } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const OnboardingTour = () => {
  useEffect(() => {
    // 1. Cek apakah user sudah pernah onboarding sebelumnya
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding_v1');

    if (hasSeenOnboarding) return;

    // 2. Definisi Driver Instance
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: false,
      doneBtnText: "Mulai Bekerja",
      nextBtnText: "Lanjut",
      prevBtnText: "Kembali",
      steps: [
        {
          element: '#dashboard-welcome', // Target ID
          popover: {
            title: '👋 Selamat Datang di Business OS',
            description: 'Mari ikuti tur singkat (kurang dari 2 menit) untuk memahami bagaimana sistem ini membantu bisnis Anda berjalan otomatis.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '#ceo-digest-widget',
          popover: {
            title: '🧠 Pilar 1: The Intelligence',
            description: 'Ini adalah **CEO Digest**. AI kami menyaring ribuan data transaksi menjadi 3 poin strategis setiap pagi. Hemat waktu Anda membaca laporan manual.',
            side: "right",
            align: 'start'
          }
        },
        {
          element: '#team-profile-section',
          popover: {
            title: '🛡️ Pilar 2: Infrastructure & Security',
            description: 'Kelola akses Tim dan Role di sini. Sistem ini menggunakan **Smart RBAC** dan **Audit Logs** untuk keamanan setara Enterprise.',
            side: "bottom",
            align: 'end'
          }
        },
        {
          element: '#credit-balance-card',
          popover: {
            title: '💳 Pilar 3: Monetization & Usage',
            description: 'Pantau penggunaan Token AI Anda secara Real-time. Sistem menggunakan **Usage-Based Billing** agar Anda hanya membayar apa yang Anda pakai.',
            side: "left",
            align: 'start'
          }
        },
        {
          element: '#api-key-section', // Nanti kita tambahkan section ini
          popover: {
            title: '🔌 API-First Platform',
            description: 'Ingin menghubungkan sistem ini dengan aplikasi lain? Anda bisa membuat API Key di menu pengaturan untuk integrasi tanpa batas.',
            side: "top",
            align: 'start'
          }
        }
      ],
      onDestroyStarted: () => {
        // Jika tur selesai atau di-skip, simpan statusnya agar tidak muncul lagi
        if (!driverObj.hasNextStep() || confirm("Apakah Anda yakin ingin melewati tur?")) {
          driverObj.destroy();
          localStorage.setItem('hasSeenOnboarding_v1', 'true');
        }
      },
    });

    // 3. Jalankan Tour (Beri sedikit delay agar UI render dulu)
    setTimeout(() => {
      driverObj.drive();
    }, 1500);

  }, []);

  return null; // Komponen ini tidak merender UI, hanya logic
};

export default OnboardingTour;