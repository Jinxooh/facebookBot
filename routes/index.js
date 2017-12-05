// modules
import express from 'express';

const SERVER_URL = process.env.BOT_DEV_ENV == 'dev' ? process.env.SERVER_URL : process.env.TEST_SERVER_URL;
const router = express.Router();

router.get('/:id', (req, res) => {
  console.log('hihi');
  res.setHeader('X-Frame-Options', 'ALLOW-FROM ' + "https://www.messenger.com/");
  res.setHeader('X-Frame-Options', 'ALLOW-FROM ' + "https://www.facebook.com/");
  res.setHeader('X-Frame-Options', 'ALLOW-FROM ' + `${SERVER_URL}`);
  res.render('./index', {demo: 'peace', title: 'Gift Preferences'});
});

export default router;