import express, { Application, Router } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middlewares';
import { swaggerSpec } from './swagger';

// Selecciona el repositorio concreto (JSON o MySQL) según variable de entorno
import { RepositoryFactory } from './data/ExpenseRepositoryFactory';

import { AuthService } from './services/AuthService';
import { ExpenseService } from './services/ExpenseService';
import { AuthController } from './controllers/AuthController';
import { ExpenseController } from './controllers/ExpenseController';

import { CacheExpenseProxy } from './patterns/proxy/CacheExpenseProxy';
import { ExpenseSubject } from './patterns/observer/ExpenseSubject';
import { HighPriorityAlertObserver } from './patterns/observer/HighPriorityAlertObserver';
import { AutocompleteTrie } from './structures/Trie';
import { ExpenseFilterContext } from './patterns/strategy/ExpenseFilterContext';
import { createAuthRoutes } from './routes/authRoutes';
import { createExpenseRoutes } from './routes/expenseRoutes';

/**
 * Configura y retorna la aplicación Express con todos los middlewares,
 * dependencias inyectadas y rutas registradas.
 */
export const createServer = (): Application => {
  const app: Application = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Repositorios
  const userRepository = RepositoryFactory.createUserRepository();
  const baseExpenseRepository = RepositoryFactory.createExpenseRepository();
  const cachedExpenseRepository = new CacheExpenseProxy(baseExpenseRepository);

  // Observer para alertas de gastos de alta prioridad
  const expenseSubject = new ExpenseSubject();
  expenseSubject.attach(new HighPriorityAlertObserver());

  const filterContext = new ExpenseFilterContext();
  const autocompleteTrie = new AutocompleteTrie();

  // Servicios y controladores
  const authService = new AuthService(userRepository);
  const expenseService = new ExpenseService(cachedExpenseRepository, expenseSubject, autocompleteTrie);

  const authController = new AuthController(authService);
  const expenseController = new ExpenseController(expenseService, filterContext, autocompleteTrie);

  // Rutas
  const apiRouter = Router();

  apiRouter.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  apiRouter.use('/auth', createAuthRoutes(authController));
  apiRouter.use('/expenses', createExpenseRoutes(expenseController));

  app.use('/api', apiRouter);

  // Documentación interactiva disponible en /api/docs
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // El middleware de errores siempre va al final
  app.use(errorHandler);

  return app;
};
