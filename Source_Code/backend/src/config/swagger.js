const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SaaS Boilerplate API',
      version: '2.0.0',
      description: 'Comprehensive API documentation for the SaaS Boilerplate Backend.',
      contact: {
        name: 'Support Team',
        url: 'https://support.yourdomain.com',
        email: 'support@yourdomain.com',
      },
    },
    servers: [
      { url: 'http://localhost:5001', description: 'Development Server' },
      { url: 'https://api.yourproduction.com', description: 'Production Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

module.exports = swaggerJsdoc(options);