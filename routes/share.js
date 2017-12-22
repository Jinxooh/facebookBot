// modules
import express from 'express';

const SERVER_URL = process.env.BOT_DEV_ENV === 'dev' ? process.env.TEST_SERVER_URL : process.env.SERVER_URL;
const APP_ID = process.env.BOT_DEV_ENV === 'dev' ? process.env.TEST_APP_ID : process.env.APP_ID;
const router = express.Router();
router.get('/:item', (req, res) => {
  // share button setting value
  const { item } = req.params;
  const array = [
    'mulbyeongjari', 'mulgogijari', 'yangjari', 'hwangsojari',
    'ssangdungijari', 'gejari', 'sajajari', 'ceonyeojari',
    'ceoncingjari', 'jeongaljari', 'sasujari', 'yeomsojari',
  ]; // address params

  const data = {
    server_url: SERVER_URL,
    share_url: 'https://www.facebook.com/v2.11/dialog/share',
    appId: APP_ID,
    hashtag: '#2018별자리운세',
    // href: `${SERVER_URL}/`,
    href: `https://jadoochat1.wixsite.com/jadoochat/forum/jadu-haengun-kadeu/2018nyeon-jadu-byeoljari-unse-${array[item]}`,
  };
  const dataJSON = JSON.stringify(data);

  res.render('./share', { data: dataJSON, item });
});

export default router;
