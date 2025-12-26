// backend/src/services/documentService.js
const prisma = require("../config/prismaClient");
const aiService = require("./aiService");

class DocumentService {
  /**
   * Simpan dokumen dan generate vektornya
   */
  async uploadDocument(teamId, title, content) {
    const embedding = await aiService.generateEmbedding(content);

    // Kita gunakan Prisma $executeRaw karena Prisma belum dukung vector type secara native di query builder
    const document = await prisma.$executeRaw`
      INSERT INTO "Document" ("id", "teamId", "title", "content", "embedding", "createdAt")
      VALUES (
        ${'doc_' + Date.now()}, 
        ${teamId}, 
        ${title}, 
        ${content}, 
        ${embedding}::vector, 
        NOW()
      )
    `;
    return document;
  }

  /**
   * Mencari potongan dokumen yang paling relevan dengan pertanyaan
   */
  async findRelevantContext(teamId, queryText) {
    const queryEmbedding = await aiService.generateEmbedding(queryText);

    // Cari 3 dokumen teratas berdasarkan Cosine Similarity (<=>)
    const documents = await prisma.$queryRaw`
      SELECT title, content, 1 - (embedding <=> ${queryEmbedding}::vector) as similarity
      FROM "Document"
      WHERE "teamId" = ${teamId}
      ORDER BY similarity DESC
      LIMIT 3
    `;

    return documents.map(d => `[Source: ${d.title}]\n${d.content}`).join("\n\n");
  }
}

module.exports = new DocumentService();