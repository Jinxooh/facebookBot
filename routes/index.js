import express from 'express';

import share from './share';
import webhooks from './webhooks';
import end from './end';

const router = express.Router();
router.get('/', (req, res) => {
  console.log('hello1');
  res.json({ success: true });
});

router.post('/', (req, res) => {
  console.log('hello2');
  res.json({ success: false });
});

router.use('/share', share);
router.use('/webhook', webhooks);
router.use('/end', end);

export default router;
