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

export const createServer = (): Application => {
  const app: Application = express();

  app.options('*', (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
  });

  app.use(cors({ origin: '*', credentials: false }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const userRepository = RepositoryFactory.createUserRepository();
  const baseExpenseRepository = RepositoryFactory.createExpenseRepository();
  const cachedExpenseRepository = new CacheExpenseProxy(baseExpenseRepository);

  const expenseSubject = new ExpenseSubject();
  expenseSubject.attach(new HighPriorityAlertObserver());
  expenseSubject.attach(new WhatsAppObserver());

  const filterContext = new ExpenseFilterContext();

  const authService = new AuthService(userRepository);
  const expenseService = new ExpenseService(cachedExpenseRepository, expenseSubject);

  const authController = new AuthController(authService);
  const expenseController = new ExpenseController(expenseService, filterContext);

  const apiRouter = Router();

  apiRouter.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  apiRouter.use('/auth', createAuthRoutes(authController));
  apiRouter.use('/expenses', createExpenseRoutes(expenseController));

  app.use('/api', apiRouter);

  if (process.env['NODE_ENV'] !== 'production') {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  app.use(errorHandler);

  return app;
};
