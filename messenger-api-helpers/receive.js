// modules
import sendApi from './send';
import dataHelper from './database';

const handleReceivePostback = async (event) => {
  const {type, data} = JSON.parse(event.postback.payload);
  const senderId = event.sender.id;

  switch (type) {
  case 'GET_STARTED':
    const userInfo = await sendApi.sendGetUserProfile(senderId);
    sendApi.sendWelcomeMessage(senderId, userInfo);
    // sendApi.sendServerUrl('psyTest');
    break;
  case 'SAY_YES_POSTBACK':
    dataHelper.sayYes();
    if(dataHelper.checkLast())
      sendApi.sendTwoButtonMessage(senderId, dataHelper.getDescription());
    else
      sendApi.sendResultMessage(senderId, dataHelper.getDescription());
  break;
  case 'SAY_NO_POSTBACK':
    dataHelper.sayNo();
    if(dataHelper.checkLast())
      sendApi.sendTwoButtonMessage(senderId, dataHelper.getDescription());
    else
      sendApi.sendResultMessage(senderId, dataHelper.getDescription());
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
  
  if (message.is_echo) {
    return;
  }
  sendApi.sendReadReceipt(senderId);

  if (message.quick_reply) {
    const { quick_reply } = message;
    handleQuickRepliesMessage(senderId, quick_reply);
    return;
  }

  if (message.text) {
    if(/(시작)+/g.test(message.text)) {
      sendApi.sendSayStartTestMessage(senderId, dataHelper.initialize());
      return;
    }
    sendApi.sendEchoMessage(senderId, message.text);
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
    sendApi.sendSayStartTestMessage(senderId, dataHelper.initialize());
  }
  if(message.text === '222') {
    sendApi.sendSayStartTestMessage(senderId, dataHelper.initialize());
  }
  if(message.text === '333') {
    sendApi.sendServerUrl('psyTest');
  }
  console.log('====== handleTestReceive DONE =========');
  return;
}

const handleQuickRepliesMessage = (senderId, quick_reply) => {
  const { type } = JSON.parse(quick_reply.payload);

  switch(type) {
    case 'SAY_START_TEST':
      // store initializeCode
      sendApi.sendSayStartTestMessage(senderId, dataHelper.initialize());
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