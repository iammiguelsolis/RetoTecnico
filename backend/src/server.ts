import express, { Application, Router } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

import { errorHandler } from './middlewares';
import { RepositoryFactory } from './data';
import { AuthService } from './services/AuthService';
import { ExpenseService } from './services/ExpenseService';
import { AuthController, ExpenseController } from './controllers';
import { createAuthRoutes, createExpenseRoutes } from './routes';

import { CacheExpenseProxy } from './patterns/proxy/CacheExpenseProxy';
import { ExpenseSubject } from './patterns/observer/ExpenseSubject';
import { HighPriorityAlertObserver } from './patterns/observer/HighPriorityAlertObserver';
import { WhatsAppObserver } from './patterns/observer/WhatsAppObserver';
import { ExpenseFilterContext } from './patterns/strategy/ExpenseFilterContext';

/**
 * Configura y retorna la aplicación Express con todos los middlewares,
 * dependencias inyectadas y rutas registradas.
 */
export const createServer = (): Application => {
  const app: Application = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // ejemplo nombre=Juan&apellido=Perez&edad=25

  // Repositorios
  const userRepository = RepositoryFactory.createUserRepository();
  const baseExpenseRepository = RepositoryFactory.createExpenseRepository();
  const cachedExpenseRepository = new CacheExpenseProxy(baseExpenseRepository); //Ahorro de recursos

  // Observer para alertas de gastos de alta prioridad
  const expenseSubject = new ExpenseSubject();
  expenseSubject.attach(new HighPriorityAlertObserver());
  expenseSubject.attach(new WhatsAppObserver());

  const filterContext = new ExpenseFilterContext();

  // Servicios y controladores
  const authService = new AuthService(userRepository);
  const expenseService = new ExpenseService(cachedExpenseRepository, expenseSubject);

  const authController = new AuthController(authService);
  const expenseController = new ExpenseController(expenseService, filterContext);

  // Rutas
  const apiRouter = Router();

  apiRouter.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  apiRouter.use('/auth', createAuthRoutes(authController));
  apiRouter.use('/expenses', createExpenseRoutes(expenseController));

  app.use('/api', apiRouter);

  // Documentación interactiva disponible en /api/docs (solo en desarrollo)
  if (process.env['NODE_ENV'] !== 'production') {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  // El middleware de errores siempre va al final
  app.use(errorHandler);

  return app;
};
