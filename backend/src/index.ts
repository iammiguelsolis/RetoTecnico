import dotenv from 'dotenv';
import { createServer } from './server';

dotenv.config();

const app = createServer();

// En Vercel (serverless), solo exportamos la app.
// En local (desarrollo), levantamos el servidor con listen().
if (process.env['VERCEL'] !== '1') {
  const PORT = process.env['PORT'] ?? 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Entorno: ${process.env['NODE_ENV'] ?? 'development'}`);
  });
}

// Vercel necesita este export para funcionar como serverless function
export default app;
