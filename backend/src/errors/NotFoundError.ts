import { AppError } from './AppError';

/**
 * NotFoundError
 *
 * Error específico para recursos no encontrados (HTTP 404).
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}
