import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { queryAnalysesRoutes } from './routes/query-analyses.routes';

export const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/query-analyses', queryAnalysesRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
