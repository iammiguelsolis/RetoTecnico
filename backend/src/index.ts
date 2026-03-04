import dotenv from 'dotenv';
import { createServer } from './server';

dotenv.config();

const app = createServer();

if (process.env['VERCEL'] !== '1') {
  const PORT = process.env['PORT'] ?? 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Entorno: ${process.env['NODE_ENV'] ?? 'development'}`);
  });
}

export default app;
