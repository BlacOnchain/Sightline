import express, { Express } from 'express';
import { apiRouter } from './routes/api';

export const app: Express = express();

app.use(express.json());

// API route namespace
app.use('/api', apiRouter);

// Global fallback error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: err instanceof Error ? err.message : 'Internal Server Error',
  });
});
