import express from 'express';
import ShareCount from '../models/shareCount';

const router = express.Router();

router.get('/', (req, res) => {
  console.log('get', req.query);
  const { psid, type } = req.query;
  ShareCount.saveShareCount(psid, type);

  res.send(`<script type="text/javascript">
  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'Messenger'));
  window.extAsyncInit = function() {
    MessengerExtensions.requestCloseBrowser(function success() {
      return;
    }, function error(err) {})
  }
  </script>`);
});

router.post('/', (req, res) => {
  const { psid, type } = req.body;
  ShareCount.saveShareCount(psid, type);
});

export default router;
