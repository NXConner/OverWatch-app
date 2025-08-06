import { Router } from 'express';
import { ApiResponse } from '@blacktop-blackout-monorepo/shared-types';

const router = Router();

// Placeholder routes for employee management
router.get('/', async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Employee routes - to be implemented',
    timestamp: new Date()
  } as ApiResponse);
});

export default router;