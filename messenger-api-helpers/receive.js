// modules
import sendApi from './send';
import dataHelper from './database';
import isEmpty from 'lodash/isEmpty';

import {
  USER_STATE,
  USER_STATUS,
  USER_RETRIES,
  USER_STATE_TAROT,
  USER_STATE_PSY,
  USER_STATUS_INIT,
  USER_STATUS_START,
  USER_STATUS_PROCESS,
  USER_STATUS_ANSWERING,
  USER_STATUS_DONE,
} from './database'

const handleReceivePostback = async (event) => {
  const {type, data} = JSON.parse(event.postback.payload);
  const senderId = event.sender.id;
  let yesOrNo = null;

  switch (type) {
  case 'GET_STARTED':
    const user = await dataHelper.getUser(senderId);
    await sendApi.sendWelcomeMessage(senderId, user);
    break;
  case 'SAY_NO_POSTBACK':
    yesOrNo = "no";
  case 'SAY_YES_POSTBACK':
    yesOrNo = yesOrNo || "yes";
    selectAnswer(senderId, yesOrNo);
  break;
  default:
    console.error(`Unknown Postback called: ${type}`);
    break;
  }
}

const handleReceiveMessage = async (event) => {
  const message = event.message;
  const senderId = event.sender.id;
  
  if(process.env.BOT_DEV_ENV === 'dev') {
    handleTestReceive(message, senderId)
  }

  if (message.quick_reply) {
    const { quick_reply } = message;
    handleQuickRepliesMessage(senderId, quick_reply);
    return;
  }

  if (message.nlp) {
    handleNlpMessage(senderId ,message, event)
  }
  sendApi.sendReadReceipt(senderId);
};

const selectAnswer = async (senderId, yesOrNo) => {
  const user = await dataHelper.getUser(senderId);
  if(dataHelper.sayYesOrNo(user, yesOrNo)) {
    if(dataHelper.checkLast(user)) {
      await sendApi.sendResultMessage(senderId, dataHelper.getDescription(user), user);
      user.setState(USER_STATUS, USER_STATUS_ANSWERING);
    }
    else {
      sendApi.sendTwoButtonMessage(senderId, dataHelper.getDescription(user));
    }
  } else {
    // click postback when test is done
    sendApi.sendSuggestRestartMessage(senderId);
  }
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

const handleNlpMessage = async (senderId, message, event) => {
  const user = await dataHelper.getUser(senderId);
  let { stateName, status } = user.getState();
  console.log('status init, ',status);
  if(status === USER_STATUS_PROCESS) {
    console.log('save');
    user.setUserQueue(event);  
    return;
  }

  const nlp = message.nlp.entities;

  if (!isEmpty(nlp)) {
    const datetime = stateName === USER_STATE_TAROT && firstEntityValue(nlp, "datetime");
    if(datetime) {
      if(nlp['datetime'][0].grain === 'day') { // 년/월/일까지 입력했을 경우 day
        const date = new Date(datetime);
        const KSTdate = new Date(date.toUTCString());
        KSTdate.setTime(KSTdate.getTime() + (9 * 3600 * 1000)); // gmt + 9h = kst
        
        const tarotDate = `${KSTdate.getFullYear()}${KSTdate.getMonth() + 1}${KSTdate.getDate()}`;
        const tarotNumber = dataHelper.selectTarot(tarotDate);

        user.setState(USER_STATUS, USER_STATUS_PROCESS);
        user.setState(USER_RETRIES, 0);
        await sendApi.sendTarotResultMessage(senderId, user, tarotNumber, dataHelper.getTarotData(tarotNumber));
        user.setState(USER_STATUS, USER_STATUS_ANSWERING);
      } else {
        sendApi.sendTarotFailureMessage(senderId, user)
      }
    }

    const self = firstEntityValue(nlp, "self");
    const play = firstEntityValue(nlp, "play");
    if(self && play) {
      user.setState(USER_STATUS, USER_STATUS_PROCESS);
      await sendApi.sendWelcomeMessage(senderId, user);
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
  
  } else {
    switch(stateName) {
      case "INIT":
        sendApi.sendDontUnderstandMessage(senderId);
      break;
      case USER_STATE_TAROT:
        if(status === USER_STATUS_ANSWERING) {
          await sendApi.sendResultThanksMessage(senderId);
          user.setState(USER_STATUS, USER_STATUS_INIT);
        } else if (status === USER_STATUS_INIT) {
          sendApi.sendDontUnderstandMessage(senderId);  
        }
        else {
          sendApi.sendTarotFailureMessage(senderId, user)
        }
      break;
      case USER_STATE_PSY:
        if(status === USER_STATUS_ANSWERING) {
          await sendApi.sendResultThanksMessage(senderId);
          user.setState(USER_STATUS, USER_STATUS_INIT);
        }
        else 
          sendApi.sendDontUnderstandMessage(senderId);
      break;
      default:
        sendApi.sendDontUnderstandMessage(senderId);
      break;
    }
  }

  status = user.getState().status;
  console.log('status done, ',status);
  const [eventObject ,...queue] = user.getUserQueue();
  if(eventObject) {
    console.log('hru');
    if(queue) user.changeUserQueue(queue);
    user.setState(USER_STATUS, status !== USER_STATUS_ANSWERING ? USER_STATUS_START : USER_STATUS_ANSWERING);
    handleReceiveMessage(eventObject);
    return;
  }
  status = user.getState().status;
  console.log('status last1, ',status);
  if(status !== USER_STATUS_ANSWERING && status !== USER_STATUS_INIT) {
    console.log('????');
    user.setState(USER_STATUS, USER_STATUS_DONE);
  }
  status = user.getState().status;
  console.log('status last2, ',status);
}

const handleQuickRepliesMessage = async (senderId, quick_reply) => {
  const { type } = JSON.parse(quick_reply.payload);
  let user = null;

  switch(type) {
    case 'SAY_TAROT_TEST':
      // store initializeCode
      user = await dataHelper.getUser(senderId);
      user.setState(USER_STATE, USER_STATE_TAROT);
      user.setState(USER_STATUS, USER_STATUS_START);
      sendApi.sendSayStartTarotMessage(senderId, user);
    break;
    case 'SAY_START_TEST':
      // store initializeCode
      user = await dataHelper.getUser(senderId);
      dataHelper.setPsyTest(user, true);
      sendApi.sendSayStartTestMessage(senderId, dataHelper.getDescription(user));
    break;
    default:
      console.log('default, ', type);
    break;
  }
}

const handleTestReceive = async (message, senderId) => {
  console.log('senderId, ', senderId);
  dataHelper.getTarotData();
  if(message.text === '111') {
    sendApi.sendShareButton(senderId);       
    return true;
  }


  if(message.text === '222') {
    sendApi.sendAnswerTarotResultMessage(senderId, "lol");       
    return true;
  }

  if(message.text === '333') {
    const user = await dataHelper.getUser(senderId);
    sendApi.sendWelcomeMessage(senderId, user);
    return true;
  }

  return false;
}

export default {
  handleReceivePostback,
  handleReceiveMessage,
}