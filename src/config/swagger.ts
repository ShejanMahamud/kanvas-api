import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wallpaper API',
      version: '1.0.0',
      description: `
        A comprehensive API for managing and accessing high-quality wallpapers.
        
        ## Features
        - User authentication and authorization
        - Wallpaper management (upload, download, search)
        - Category management
        - Subscription handling
        - Push notifications
        - Health monitoring
        
        ## Rate Limiting
        - Authentication endpoints: 5 requests per minute
        - API endpoints: 60 requests per minute
        - File uploads: 10 requests per minute
        
        ## Authentication
        All API endpoints require a valid API key in the X-API-Key header.
        Format: \`X-API-Key: <your-api-key>\`
        
        Additionally, authenticated endpoints require a valid JWT token in the Authorization header.
        Format: \`Authorization: Bearer <token>\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@wallpaper-app.com',
        url: 'https://wallpaper-app.com/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.wallpaper-app.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key required for all endpoints',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT token obtained from the login endpoint. Format: Bearer <token>',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Error code for programmatic handling',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  description: 'Human-readable error message',
                  example: 'Invalid input data',
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                        description: 'Field that caused the error',
                        example: 'email',
                      },
                      message: {
                        type: 'string',
                        description: 'Field-specific error message',
                        example: 'Invalid email format',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        Wallpaper: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the wallpaper',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: {
              type: 'string',
              description: 'Title of the wallpaper',
              example: 'Mountain Sunset',
            },
            description: {
              type: 'string',
              description: 'Detailed description of the wallpaper',
              example: 'Beautiful sunset over mountain landscape',
            },
            imageUrl: {
              type: 'string',
              description: 'URL to the full resolution image',
              example:
                'https://cdn.wallpaper-app.com/images/mountain-sunset.jpg',
            },
            thumbnailUrl: {
              type: 'string',
              description: 'URL to the thumbnail image',
              example:
                'https://cdn.wallpaper-app.com/thumbnails/mountain-sunset.jpg',
            },
            category: {
              type: 'string',
              description: 'Category ID the wallpaper belongs to',
              example: 'nature',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
                description: 'Tags associated with the wallpaper',
                example: ['nature', 'sunset', 'mountains'],
              },
            },
            isPremium: {
              type: 'boolean',
              description:
                'Whether the wallpaper requires a premium subscription',
              example: true,
            },
            subscriptionTier: {
              type: 'string',
              enum: ['free', 'basic', 'premium'],
              description:
                'Minimum subscription tier required to access this wallpaper',
              example: 'premium',
            },
            downloads: {
              type: 'number',
              description: 'Number of times the wallpaper has been downloaded',
              example: 1500,
            },
            likes: {
              type: 'number',
              description: 'Number of likes received',
              example: 250,
            },
            resolution: {
              type: 'string',
              description: 'Image resolution',
              example: '3840x2160',
            },
            aspectRatio: {
              type: 'string',
              description: 'Image aspect ratio',
              example: '16:9',
            },
            fileSize: {
              type: 'number',
              description: 'File size in bytes',
              example: 5242880,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-03-15T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-03-15T10:30:00Z',
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the category',
              example: 'nature',
            },
            name: {
              type: 'string',
              description: 'Category name',
              example: 'Nature',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly category identifier',
              example: 'nature',
            },
            description: {
              type: 'string',
              description: 'Category description',
              example: 'Beautiful nature wallpapers',
            },
            wallpaperCount: {
              type: 'number',
              description: 'Number of wallpapers in this category',
              example: 150,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-03-15T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-03-15T10:30:00Z',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the user',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              description: "User's full name",
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: "User's email address",
              example: 'john.doe@example.com',
            },
            subscriptionTier: {
              type: 'string',
              enum: ['free', 'basic', 'premium'],
              description: "User's current subscription tier",
              example: 'premium',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
              example: '2024-03-15T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-03-15T10:30:00Z',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total number of items',
              example: 100,
            },
            page: {
              type: 'number',
              description: 'Current page number',
              example: 1,
            },
            limit: {
              type: 'number',
              description: 'Number of items per page',
              example: 10,
            },
            pages: {
              type: 'number',
              description: 'Total number of pages',
              example: 10,
            },
            hasNext: {
              type: 'boolean',
              description: 'Whether there is a next page',
              example: true,
            },
            hasPrevious: {
              type: 'boolean',
              description: 'Whether there is a previous page',
              example: false,
            },
          },
        },
        Subscription: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the subscription',
              example: 'sub_123456789',
            },
            tier: {
              type: 'string',
              enum: ['free', 'basic', 'premium'],
              description: 'Subscription tier',
              example: 'premium',
            },
            status: {
              type: 'string',
              enum: ['active', 'cancelled', 'expired'],
              description: 'Current subscription status',
              example: 'active',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Subscription start date',
              example: '2024-03-15T10:30:00Z',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Subscription end date',
              example: '2024-04-15T10:30:00Z',
            },
          },
        },
      },
    },
    security: [
      {
        apiKey: [],
      },
    ],
    tags: [
      {
        name: 'Auth',
        description:
          'Authentication and authorization endpoints for user management',
      },
      {
        name: 'Wallpapers',
        description: 'Endpoints for managing and accessing wallpapers',
      },
      {
        name: 'Categories',
        description: 'Endpoints for managing wallpaper categories',
      },
      {
        name: 'Health',
        description: 'Health check and monitoring endpoints',
      },
      {
        name: 'Subscriptions',
        description: 'Subscription management and billing endpoints',
      },
      {
        name: 'Notifications',
        description: 'Push notification and device token management endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
