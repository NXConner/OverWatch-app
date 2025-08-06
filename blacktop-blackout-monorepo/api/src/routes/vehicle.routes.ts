import { Router } from 'express';
import { ApiResponse } from '@blacktop-blackout-monorepo/shared-types';

const router = Router();

// Placeholder routes for vehicle management
router.get('/', async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Vehicle routes - to be implemented',
    timestamp: new Date()
  } as ApiResponse);
});

export default router;