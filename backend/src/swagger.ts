import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Gastos',
      version: '1.0.0',
      description:
        'API REST para gestionar ingresos y gastos personales. ' +
        'Los endpoints de gastos requieren autenticación JWT.',
    },
    servers: [
      { url: 'http://localhost:3000/api', description: 'Servidor local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Expense: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            userId: { type: 'string', example: 'user-uuid' },
            title: { type: 'string', example: 'Almuerzo de trabajo' },
            reason: { type: 'string', example: 'Reunión con cliente' },
            date: { type: 'string', format: 'date-time', example: '2026-03-01T12:00:00.000Z' },
            amount: { type: 'number', example: 45.50 },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            priorityLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            reminderDate: { type: 'string', format: 'date-time', nullable: true, example: null },
            isRecurring: { type: 'boolean', example: false },
            frequency: { type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'], nullable: true, example: null },
            interval: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateExpenseDTO: {
          type: 'object',
          required: ['title', 'reason', 'date', 'amount', 'type'],
          properties: {
            title: { type: 'string', example: 'Almuerzo de trabajo' },
            reason: { type: 'string', example: 'Reunión con cliente' },
            date: { type: 'string', format: 'date-time', example: '2026-03-01T12:00:00.000Z' },
            amount: { type: 'number', example: 45.50 },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE' },
            priorityLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'MEDIUM' },
            reminderDate: { type: 'string', format: 'date-time', nullable: true },
            isRecurring: { type: 'boolean', example: false },
            frequency: { type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'], nullable: true },
            interval: { type: 'integer', example: 1 },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['Sistema'],
          summary: 'Verificar que el servidor está activo',
          responses: {
            200: {
              description: 'Servidor activo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', example: '2026-03-01T12:00:00.000Z' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Autenticación'],
          summary: 'Registrar un nuevo usuario',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Miguel Solis' },
                    email: { type: 'string', example: 'miguel@email.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Usuario creado exitosamente' },
            400: { description: 'Datos inválidos o email ya registrado' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Autenticación'],
          summary: 'Iniciar sesión y obtener un token JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'miguel@email.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login exitoso — retorna token JWT' },
            401: { description: 'Credenciales incorrectas' },
          },
        },
      },
      '/expenses': {
        get: {
          tags: ['Gastos'],
          summary: 'Listar todos los gastos del usuario autenticado',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Lista de gastos',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Expense' } },
                      count: { type: 'integer', example: 5 },
                    },
                  },
                },
              },
            },
            401: { description: 'Token no proporcionado o inválido' },
          },
        },
        post: {
          tags: ['Gastos'],
          summary: 'Crear un nuevo gasto o ingreso',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateExpenseDTO' },
              },
            },
          },
          responses: {
            201: {
              description: 'Gasto creado exitosamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: { $ref: '#/components/schemas/Expense' },
                    },
                  },
                },
              },
            },
            400: { description: 'Datos inválidos' },
            401: { description: 'No autorizado' },
          },
        },
      },
      '/expenses/month/{year}/{month}': {
        get: {
          tags: ['Gastos'],
          summary: 'Filtrar gastos por mes y año',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'year', in: 'path', required: true, schema: { type: 'integer', example: 2026 }, description: 'Año (ej: 2026)' },
            { name: 'month', in: 'path', required: true, schema: { type: 'integer', example: 3 }, description: 'Mes numérico: 1=Enero, 12=Diciembre' },
          ],
          responses: {
            200: { description: 'Gastos del mes indicado' },
            400: { description: 'Parámetros inválidos' },
            401: { description: 'No autorizado' },
          },
        },
      },
      '/expenses/{id}': {
        put: {
          tags: ['Gastos'],
          summary: 'Actualizar un gasto existente',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del gasto a actualizar' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateExpenseDTO' },
              },
            },
          },
          responses: {
            200: { description: 'Gasto actualizado' },
            404: { description: 'Gasto no encontrado' },
            401: { description: 'No autorizado' },
          },
        },
        delete: {
          tags: ['Gastos'],
          summary: 'Eliminar un gasto',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del gasto a eliminar' },
          ],
          responses: {
            200: { description: 'Gasto eliminado exitosamente' },
            404: { description: 'Gasto no encontrado' },
            401: { description: 'No autorizado' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
