// modules
import express from 'express';

const SERVER_URL = process.env.BOT_DEV_ENV === 'dev' ? process.env.TEST_SERVER_URL : process.env.SERVER_URL;
const APP_ID = process.env.BOT_DEV_ENV === 'dev' ? process.env.TEST_APP_ID : process.env.APP_ID;
const router = express.Router();

router.get('/', (req, res) => {
  const data = {
    server_url: SERVER_URL,
    appId: APP_ID,
  };
  const dataJSON = JSON.stringify(data);

  res.render('./end', { data: dataJSON });
});

export default router;
