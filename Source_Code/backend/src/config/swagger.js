const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0', // Standar OpenAPI yang digunakan
    info: {
      title: 'SaaS Boilerplate API Documentation',
      version: '2.0.0',
      description: 'Dokumentasi lengkap untuk endpoint API Backend.',
      contact: {
        name: 'Developer Support',
        email: 'support@yourdomain.com', // Ganti dengan email Anda
      },
    },
    servers: [
      {
        url: 'http://localhost:5001', // URL Server Lokal
        description: 'Development Server',
      },
      // Anda bisa tambah URL Production nanti
      // { url: 'https://api.your-production.com', description: 'Production Server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Menandakan kita pakai Token JWT
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Terapkan keamanan ini secara global (opsional)
      },
    ],
  },
  // Lokasi file tempat kita menulis dokumentasi (PENTING)
  apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;