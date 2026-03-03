import express, { Application, Router } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares';

// Factory (mantiene JSON + MySQL)
import { RepositoryFactory } from './data/ExpenseRepositoryFactory';

// Servicios
import { AuthService } from './services/AuthService';
import { ExpenseService } from './services/ExpenseService';

// Controladores
import { AuthController } from './controllers/AuthController';
import { ExpenseController } from './controllers/ExpenseController';

// ── Enterprise Patterns ──
import { CacheExpenseProxy } from './patterns/proxy/CacheExpenseProxy';
import { ExpenseSubject } from './patterns/observer/ExpenseSubject';
import { HighPriorityAlertObserver } from './patterns/observer/HighPriorityAlertObserver';
import { AutocompleteTrie } from './structures/Trie';
import { ExpenseFilterContext } from './patterns/strategy/ExpenseFilterContext';

// Rutas
import { createAuthRoutes } from './routes/authRoutes';
import { createExpenseRoutes } from './routes/expenseRoutes';

/**
 * createServer
 *
 * Inyección de dependencias vía RepositoryFactory:
 *   STORAGE_TYPE (json|mysql) → Repos → Services → Controllers → Routes
 */
export const createServer = (): Application => {
  const app: Application = express();

  // Middlewares globales
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Composition Root (Factory Pattern & Decorator) ──
  const userRepository = RepositoryFactory.createUserRepository();
  const baseExpenseRepository = RepositoryFactory.createExpenseRepository();
  const cachedExpenseRepository = new CacheExpenseProxy(baseExpenseRepository);

  // ── Observer Pattern ──
  const expenseSubject = new ExpenseSubject();
  expenseSubject.attach(new HighPriorityAlertObserver());

  // ── Strategy Pattern ──
  const filterContext = new ExpenseFilterContext();

  // ── Trie Autocomplete ──
  const autocompleteTrie = new AutocompleteTrie();

  // ── Inyección de Dependencias ──
  const authService = new AuthService(userRepository);
  const expenseService = new ExpenseService(cachedExpenseRepository, expenseSubject, autocompleteTrie);

  const authController = new AuthController(authService);
  const expenseController = new ExpenseController(expenseService, filterContext, autocompleteTrie);

  // ── Rutas ──
  const apiRouter = Router();

  apiRouter.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  apiRouter.use('/auth', createAuthRoutes(authController));
  apiRouter.use('/expenses', createExpenseRoutes(expenseController));

  app.use('/api', apiRouter);

  // Error handler (siempre al final)
  app.use(errorHandler);

  return app;
};
