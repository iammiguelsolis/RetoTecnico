import dotenv from 'dotenv';
import { createServer } from './server';

// Carga las variables de entorno desde .env
dotenv.config();

const PORT = process.env['PORT'] ?? 3000;

const app = createServer();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Entorno: ${process.env['NODE_ENV'] ?? 'development'}`);
});
