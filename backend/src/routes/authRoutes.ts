import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';

export const createAuthRoutes = (controller: AuthController): Router => {
  const router = Router();
  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/me', authMiddleware, controller.getProfile);
  router.put('/budget', authMiddleware, controller.updateBudget);
  return router;
};
