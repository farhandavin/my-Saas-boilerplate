// backend/src/services/apiKeyService.js
const crypto = require("crypto");
const prisma = require("../config/prismaClient");

class ApiKeyService {
  /**
   * Membuat API Key baru untuk Team.
   * Hanya mengembalikan key mentah SATU KALI saja.
   */
  async createKey(teamId, name) {
    // 1. Generate Random Key (32 bytes hex)
    const rawKey = 'sk_live_' + crypto.randomBytes(24).toString('hex');
    
    // 2. Hash Key untuk penyimpanan (SHA-256)
    const keyHash = crypto
      .createHash('sha256')
      .update(rawKey)
      .digest('hex');

    // 3. Ambil 7 karakter pertama untuk display (Prefix)
    const prefix = rawKey.substring(0, 10) + '...';

    // 4. Simpan ke DB
    const apiKeyRecord = await prisma.apiKey.create({
      data: {
        teamId,
        name,
        prefix,
        keyHash
      }
    });

    // PENTING: Kembalikan rawKey agar bisa ditampilkan ke user SEKALI saja
    return { ...apiKeyRecord, secretKey: rawKey };
  }

  /**
   * Validasi API Key dari request masuk
   */
  async validateKey(rawKey) {
    if (!rawKey || !rawKey.startsWith('sk_live_')) return null;

    // 1. Hash key yang diterima
    const incomingHash = crypto
      .createHash('sha256')
      .update(rawKey)
      .digest('hex');

    // 2. Cari di DB
    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash: incomingHash },
      include: { team: true } // Include team untuk konteks billing
    });

    if (!apiKey) return null;

    // 3. Update lastUsedAt (Async, fire-and-forget)
    prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() }
    }).catch(console.error);

    return apiKey.team;
  }
}

module.exports = new ApiKeyService();