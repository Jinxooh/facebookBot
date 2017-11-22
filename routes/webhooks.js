// modules
import express from 'express';

// messenger
import receiveApi from '../messenger-api-helpers/receive';

const router = express.Router();


router.get('/', (req, res) => {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong token');
  }
});

router.post('/', (req, res) => {
  res.sendStatus(200);

  const data = req.body;

  if (data.object === 'page') {
    data.entry.forEach((pageEntry) => {
      // console.log({pageEntry});
      pageEntry.messaging && pageEntry.messaging.forEach((messagingEvent) => {
        // console.log({messagingEvent});
        if (messagingEvent.message && !messagingEvent.message.is_echo) {
          receiveApi.handleReceiveMessage(messagingEvent);
        } else if (messagingEvent.postback) {
          receiveApi.handleReceivePostback(messagingEvent);
        } else if (messagingEvent.referral) {
          receiveApi.handleReceiveReferral(messagingEvent);
        } else {
          console.log(
            'Webhook received unknown messagingEvent: ',
            messagingEvent
          );
        }
      });
    });
  }
});

export default router;