import { Request, Response } from 'express';
import { queryAnalysesService } from '../services/query-analyses.service';
import { QueryValidationError } from '../validators/query.validator';

export const queryAnalysesController = {
  async analyze(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query is required and must be a string' });
        return;
      }

      const analysis = await queryAnalysesService.analyzeQuery(query);
      res.json(analysis);
    } catch (error) {
      if (error instanceof QueryValidationError) {
        res.status(400).json({ 
          error: 'Query validation failed',
          message: error.message
        });
        return;
      }

      console.error('Error analyzing query:', error);
      res.status(500).json({ 
        error: 'Failed to analyze query',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
