import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sports Monitor API',
      version: '1.0.0',
      description:
        'Interactive world sports dashboard with AI-powered insights',
      contact: {
        name: 'Sports Monitor Team',
        email: 'support@sports-monitor.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
      {
        url: 'https://api.sports-monitor.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /auth/login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            username: {
              type: 'string',
            },
            avatar_url: {
              type: 'string',
              format: 'uri',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Match: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            sport: {
              type: 'string',
              enum: ['Football', 'Cricket', 'Basketball', 'Tennis'],
            },
            home_team_name: {
              type: 'string',
            },
            away_team_name: {
              type: 'string',
            },
            start_time: {
              type: 'string',
              format: 'date-time',
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'live', 'finished'],
            },
            home_score: {
              type: 'integer',
            },
            away_score: {
              type: 'integer',
            },
            country_code: {
              type: 'string',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            tokens: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                },
                refreshToken: {
                  type: 'string',
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Sports',
        description: 'Sports events and matches',
      },
      {
        name: 'AI',
        description: 'AI-powered features',
      },
      {
        name: 'User',
        description: 'User profile and preferences',
      },
    ],
  },
  apis: ['./src/api/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(specs, { explorer: true }));
  console.log('📚 API documentation available at /api-docs');
};

export default specs;
