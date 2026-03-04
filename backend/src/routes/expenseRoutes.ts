import { Router } from 'express';
import { ExpenseController } from '../controllers/ExpenseController';
import { authMiddleware } from '../middlewares/authMiddleware';

export const createExpenseRoutes = (controller: ExpenseController): Router => {
  const router = Router();
  // Todas protegidas con JWT
  router.use(authMiddleware);
  router.get('/', controller.getAll);
  router.get('/month/:year/:month', controller.getByMonth);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);
  return router;
};
