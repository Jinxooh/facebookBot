// modules
import express from 'express';

const SERVER_URL = process.env.BOT_DEV_ENV === 'dev' ? process.env.TEST_SERVER_URL : process.env.SERVER_URL;
const router = express.Router();
router.get('/:item', (req, res) => {
  console.log('share share');
  console.log(req.params.item);
  // share button setting value
  const { item } = req.params;
  const array = ['gejari'];

  const data = {
    server_url: SERVER_URL,
    share_url: 'https://www.facebook.com/v2.11/dialog/share',
    appId: '552043455131217',
    hashtag: '#hello!!',
    // href: `${SERVER_URL}/`,
    href: `https://jadoochat1.wixsite.com/jadoochat/forum/2018-byeoljari-kadeu/${array[item]}`,
  };
  const dataJSON = JSON.stringify(data);

  res.render('./share', { data: dataJSON, item });
});

export default router;
