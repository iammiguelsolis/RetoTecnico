/**
 * AppError
 *
 * Clase base para errores personalizados de la aplicación.
 * Extiende Error nativo y agrega statusCode para respuestas HTTP.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Mantiene la referencia correcta al prototype
    Object.setPrototypeOf(this, new.target.prototype);

    // Captura el stack trace sin incluir el constructor
    Error.captureStackTrace(this, this.constructor);
  }
}
