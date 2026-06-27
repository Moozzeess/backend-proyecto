const swaggerJsdoc = require('swagger-jsdoc');

const opciones = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pizza Pizza API',
      version: '1.0.0',
      description: 'Documentación de la API del sistema Pizza Pizza'
    },
    servers: [
      {
        url: 'https://backend-proyecto-4i0l.onrender.com/api',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./rutas/*.js']
};

const especificacion = swaggerJsdoc(opciones);

module.exports = especificacion;
