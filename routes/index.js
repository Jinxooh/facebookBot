// modules
import express from 'express';

const SERVER_URL = process.env.BOT_DEV_ENV === 'dev' ? process.env.TEST_SERVER_URL : process.env.SERVER_URL;
const router = express.Router();

router.get('/', (req, res) => {
  // share button setting value
  const data = {
    server_url: SERVER_URL,
    share_url: 'https://www.facebook.com/v2.11/dialog/share',
    appId: '552043455131217',
    hashtag: ('#hello!!'),
    // href: `${SERVER_URL}/`,
    href: 'https://fierce-beyond-56689.herokuapp.com/share',
  };
  const dataJSON = JSON.stringify(data);

  res.render('./index', { data: dataJSON });
});

export default router;
