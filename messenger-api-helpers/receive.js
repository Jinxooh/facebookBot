// modules
import sendApi from './send';
import dataHelper from './database';
import isEmpty from 'lodash/isEmpty';

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
    if (!isEmpty(message.nlp.entities)) {
      handleNlpMessage(senderId ,message.nlp.entities)
    } else {
      console.log('I DONT UNDERSTAND')
      sendApi.sendDontUnderstandMessage(senderId);
    }
  }
};

const handleTestReceive = async (message, senderId) => {
  console.log('====== handleTestReceive START =========');
  console.log('message, ', message);
  if(message.text === '111') {
    sendApi.sendGetUserProfile(senderId);
  }
  if(message.text === '222') {
    sendApi.sendSuggestRestartMessage(senderId);
  }
  console.log('====== handleTestReceive DONE =========');
  return;
}

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const handleNlpMessage = (senderId, nlp) => {
  const intent = firstEntityValue(nlp, "intent");
  if(intent) {
    switch(intent) {
      case "start_test":
      sendApi.sendSayStartTestMessage(senderId, dataHelper.initialize(senderId));
      break;
      case "positive":
      sendApi.sendSayStartTestMessage(senderId, dataHelper.initialize(senderId));
      break;
      case "negative":
      sendApi.sendSayStartTestMessage(senderId, dataHelper.initialize(senderId));
      break;
    }
  }

  const greeting = firstEntityValue(nlp, "greeting");
  if(greeting) {
    switch(greeting) {
      case "say_hi":
      sendApi.sendSayHiMessage(senderId);
      break;
      case "nice_meet":
      sendApi.sendNiceMeetMessage(senderId);
      break;
    }
  }

  const myself = firstEntityValue(nlp, "myself");
  if(myself) {
    switch(myself) {
      case "call_me":
      sendApi.sendCallMeMessage(senderId);
      break;
    }
  }


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
}