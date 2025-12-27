// backend/src/services/analyticsService.js

class AnalyticsService {
  /**
   * Mengambil data operasional harian (Simulasi)
   * Dalam production, ini akan query ke DB: Transaction, User, Log, dll.
   */
  async getDailyStats(teamId) {
    // Simulasi data yang dinamis agar hasil AI tidak monoton
    const randomRevenue = Math.floor(Math.random() * 5000000) + 1000000;
    const randomUsers = Math.floor(Math.random() * 50) + 5;
    const randomChurn = Math.floor(Math.random() * 5);
    
    return {
      date: new Date().toISOString().split('T')[0],
      financial: {
        totalRevenue: `IDR ${randomRevenue.toLocaleString('id-ID')}`,
        expense: "IDR 1.500.000",
        profitMargin: "Variable", // Biar AI yang hitung
      },
      userGrowth: {
        newSignups: randomUsers,
        activeUsers: 1240,
        churnedUsers: randomChurn, // User yang berhenti
      },
      operational: {
        serverUptime: "99.98%",
        errorLogs: 23, // Ada sedikit error
        pendingSupportTickets: 5
      },
      topSellingProduct: "Enterprise AI Plan"
    };
  }
}

module.exports = new AnalyticsService();