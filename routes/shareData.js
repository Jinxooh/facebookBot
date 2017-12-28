import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  console.log('get', req.query);
});

router.post('/', (req, res) => {
  console.log('post', req.body);
});

export default router;
