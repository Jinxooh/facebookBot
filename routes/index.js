import express from 'express';

import share from './share';
import webhooks from './webhooks';
import end from './end';

const router = express.Router();

router.use('/share', share);
router.use('/webhook', webhooks);
router.use('/end', end);

export default router;
