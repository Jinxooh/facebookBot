// modules
import express from 'express';

const SERVER_URL = process.env.BOT_DEV_ENV == 'dev' ? process.env.TEST_SERVER_URL : process.env.SERVER_URL;
const router = express.Router();

router.get('/', (req, res) => {
  console.log('//////////,' , req.params.sid);
  res.render('./index', {title: 'Gift Preferences'});
});

export default router;