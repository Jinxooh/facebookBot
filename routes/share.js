// modules
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('./share', {title: 'done'});
});

router.get('/:id', (req, res) => {
  console.log('req', req);
  console.log('res', res);
});


export default router;