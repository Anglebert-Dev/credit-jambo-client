import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Credit Jambo Client API',
      version: '1.0.0',
      description: 'Digital Credit & Savings Platform - Customer API',
      contact: {
        name: 'Credit Jambo Ltd',
        email: 'hello@creditjambo.com',
        url: 'https://www.creditjambo.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.controller.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
