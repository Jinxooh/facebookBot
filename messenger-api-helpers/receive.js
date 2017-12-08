// modules
import sendApi from './send';
import dataHelper from './database';
import isEmpty from 'lodash/isEmpty';

import {
  USER_STATE_INIT,
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
    sendApi.sendWelcomeMessage(senderId);
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

  if (message.sticker_id) {
    console.log('sticker!!')
    handleStickerMessage(senderId, message);
  }
  sendApi.sendReadReceipt(senderId);
};

const selectAnswer = async (senderId, yesOrNo) => {
  if(dataHelper.sayYesOrNo(senderId, yesOrNo)) {
    if(dataHelper.checkLast(user)) {
      await sendApi.sendResultMessage(senderId, dataHelper.getDescription(user), user);
      dataHelper.setUser(senderId, {userState: {status: USER_STATUS_ANSWERING}});
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

const handleStickerMessage = async (senderId, message) => {
  const user = await dataHelper.getUser(senderId);
  const { stateName, status } = user.userState;
  console.log('Sticker stateName, ',stateName)
  console.log('Sticker status, ',status)
  switch(stateName) {
    case USER_STATE_INIT:
    break;
    case USER_STATE_TAROT:
    break;
    case USER_STATE_PSY:
    break;
  }
}

const handleNlpMessage = async (senderId, message, event) => {
  let user = await dataHelper.getUser(senderId);
  let { stateName, status } = user.userState;
  console.log('status,, ', status);
  // console.log('stateName,, ', stateName);
  if(status === USER_STATUS_PROCESS) {
    console.log('save');
    dataHelper.updateUserQueue(senderId, event);  
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

        await dataHelper.setUser(senderId, {userState: {status: USER_STATUS_PROCESS, retries: 0}});
        await sendApi.sendTarotResultMessage(senderId, user, tarotNumber, dataHelper.getTarotData(tarotNumber));
        await dataHelper.setUser(senderId, {userState: {status: USER_STATUS_ANSWERING}});
      } else {
        sendApi.sendTarotFailureMessage(senderId, user)
      }
    }

    const self = firstEntityValue(nlp, "self");
    const play = firstEntityValue(nlp, "play");
    if(self || play) {
      await dataHelper.setUser(senderId, {userState: {status: USER_STATUS_PROCESS}});
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
      case USER_STATE_INIT:
        sendApi.sendDontUnderstandMessage(senderId);
      break;
      case USER_STATE_TAROT:
        if(status === USER_STATUS_ANSWERING) {
          await sendApi.sendResultThanksMessage(senderId);
          await dataHelper.setUser(senderId, {userState: {status: USER_STATUS_INIT}});
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
          await dataHelper.setUser(senderId, {userState: {status: USER_STATUS_INIT}});
        }
        else 
          sendApi.sendDontUnderstandMessage(senderId);
      break;
      default:
        sendApi.sendDontUnderstandMessage(senderId);
      break;
    }
  }

  user = await dataHelper.getUser(senderId);
  status = user.userState.status;
  console.log('done sstatus, ', status);
  const [eventObject ,...userQueue] = user.userQueue;
  console.log('DONE user.userQueue, ', user.userQueue, 'eventObject:', eventObject, '...userQueue, ', userQueue);
  if(eventObject) {
    console.log('here')
    if(userQueue) dataHelper.setUser(senderId, { userQueue });
    const statusName = (status !== USER_STATUS_ANSWERING) ? USER_STATUS_START : USER_STATUS_ANSWERING
    await dataHelper.setUser(senderId, {userState: {status: statusName}});
    handleReceiveMessage(eventObject);
    console.log('done!')
    return;
  }

  if(status !== USER_STATUS_ANSWERING && status !== USER_STATUS_INIT) {
    await dataHelper.setUser(senderId, {userState: {status: USER_STATUS_DONE}});
  }
}

const handleQuickRepliesMessage = async (senderId, quick_reply) => {
  const { type } = JSON.parse(quick_reply.payload);
  let user = null;

  switch(type) {
    case 'SAY_TAROT_TEST':
      // store initializeCode
      await dataHelper.setUser(senderId, { userState: { stateName: USER_STATE_TAROT, status: USER_STATUS_START }});
      user = await dataHelper.getUser(senderId);
      sendApi.sendSayStartTarotMessage(senderId, user);
    break;
    case 'SAY_START_TEST':
      // store initializeCode
      dataHelper.setPsyTest(senderId, true);
      sendApi.sendSayStartTestMessage(senderId, dataHelper.getDescription(user));
    break;
    default:
      console.log('default, ', type);
    break;
  }
}

const handleTestReceive = async (message, senderId) => {
  // console.log('senderId, ', senderId);
  dataHelper.getTarotData();
  if(message.text === '1') {
    await sendApi.sendWelcomeMessage(senderId);
    return true;
  }


  if(message.text === '2') {
    const user = await dataHelper.getUser(senderId);
    console.log('user', user.next);
    const updateData = { next: String(Math.floor(Math.random() * 5 + 1))};
    console.log('updateData next', updateData.next);
    const updateUser = await dataHelper.setUser(senderId, updateData);
    console.log('updated user', updateUser.next);
    // sendApi.sendAnswerTarotResultMessage(senderId, "lol");       
    return true;
  }

  if(message.text === '3') {
    dataHelper.updateAllUserStateInitialize();
    return true;
  }

  return false;
}

export default {
  handleReceivePostback,
  handleReceiveMessage,
}