// modules
import sendApi from './send';
import dataHelper from './database';
import _ from 'lodash/object';

const handleReceivePostback = async (event) => {
  const {type, data} = JSON.parse(event.postback.payload);
  const senderId = event.sender.id;

  switch (type) {
  case 'GET_STARTED':
    const userInfo = await sendApi.sendGetUserProfile(senderId);
    sendApi.sendWelcomeMessage(senderId, userInfo);
    break;
  case 'SAY_YES_POSTBACK':
    if(dataHelper.sayYes(senderId)) {
      if(dataHelper.checkLast(senderId)) {
        sendApi.sendResultMessage(senderId, dataHelper.getDescription(senderId));
      }
      else {
        sendApi.sendTwoButtonMessage(senderId, dataHelper.getDescription(senderId));
      }
    } else {
      // click postback when test is done
      sendApi.sendSuggestRestartMessage(senderId);
    }
  break;
  case 'SAY_NO_POSTBACK':
    if(dataHelper.sayNo(senderId)) {
      if(dataHelper.checkLast(senderId)) {
        sendApi.sendResultMessage(senderId, dataHelper.getDescription(senderId));
      }
      else {
        sendApi.sendTwoButtonMessage(senderId, dataHelper.getDescription(senderId));
      }
    } else {
      // click postback when test is done
      sendApi.sendSuggestRestartMessage(senderId);
    }
  break;
  default:
    console.error(`Unknown Postback called: ${type}`);
    break;
  }
}

const handleReceiveMessage = (event) => {
  const message = event.message;
  const senderId = event.sender.id;
  
  if(process.env.BOT_DEV_ENV === 'dev') {
    handleTestReceive(message, senderId);
  }

  sendApi.sendReadReceipt(senderId);

  if (message.quick_reply) {
    const { quick_reply } = message;
    handleQuickRepliesMessage(senderId, quick_reply);
    return;
  }
  if (message.nlp) {
    if (message.nlp.entities) {
      console.log('has entities, ', message.nlp.entities);
      const keyNames = _.keys(message.nlp.entities);
      console.log(keyNames);
    }
  }
  if (message.text) {
    if(/(시작)+/g.test(message.text)) {
      sendApi.sendSayStartTestMessage(senderId, dataHelper.initialize(senderId));
      return;
    }
    // sendApi.sendEchoMessage(senderId, message.text);
  }
};

const handleReceiveReferral = (event) => {
  const senderId = event.sender.id;
  let payload = {};

  if (event.referral.ref){
    payload["ref"] = event.referral.ref;
  }
  if (event.referral.ad_id){
    payload["ad_id"] = event.referral.ad_id;
  }
}

const handleTestReceive = (message, senderId) => {
  console.log('====== handleTestReceive START =========');
  console.log('message, ', message);
  if(message.text === '111') {
    sendApi.sendGetUserProfile(senderId);
  }
  console.log('====== handleTestReceive DONE =========');
  return;
}

const handleQuickRepliesMessage = (senderId, quick_reply) => {
  const { type } = JSON.parse(quick_reply.payload);

  switch(type) {
    case 'SAY_START_TEST':
      // store initializeCode
      sendApi.sendSayStartTestMessage(senderId, dataHelper.initialize(senderId));
    break;
    case 'SAY_STOP_TEST':
      sendApi.sendSayStopTestMessage(senderId);
    break;
    default:
      console.log('default, ', type);
    break;
  }
}

export default {
  handleReceivePostback,
  handleReceiveMessage,
  handleReceiveReferral,
}