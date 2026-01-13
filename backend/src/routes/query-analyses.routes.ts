import { Router } from 'express';
import { queryAnalysesController } from '../controllers/query-analyses.controller';

export const queryAnalysesRoutes = Router();

queryAnalysesRoutes.post('/', queryAnalysesController.analyze);
