// modules
import sendApi from './send';
import dataHelper from './database';
import isEmpty from 'lodash/isEmpty';

const handleReceivePostback = async (event) => {
  const {type, data} = JSON.parse(event.postback.payload);
  const senderId = event.sender.id;
  let yesOrNo = null;

  switch (type) {
  case 'GET_STARTED':
    const user = await dataHelper.getUser(senderId);
    sendApi.sendWelcomeMessage(senderId, user);
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

  sendApi.sendReadReceipt(senderId);

  if (message.quick_reply) {
    const { quick_reply } = message;
    handleQuickRepliesMessage(senderId, quick_reply);
    return;
  }

  if (message.nlp) {
    const user = await dataHelper.getUser(senderId);
    const userState = user.getState();
    
    if(userState['status'] === 'answering') {
      console.log(' ==== twice');
      user.setUserQueue(event);
    }
    if (!isEmpty(message.nlp.entities)) {
      handleNlpMessage(senderId ,message.nlp.entities)
    } else {
      switch(userState['name']) {
        case "INIT":
          sendApi.sendDontUnderstandMessage(senderId);
        break;
        case "TAROT":
          if(userState['status'] === 'start') {
            user.setState('status', 'answering');
            await sendApi.sendAnswerTarotResultMessage(senderId, message.text);
            // await done();
            // await console.log('happy senario, ', userQueue);
            const [event ,...queue] = user.getUserQueue();
            if(event) {
              user.setState("status", "start");
              if(queue) user.setUserQueue(queue);
              handleReceiveMessage(event);
            }
            
          }
          else if(userState['status'] === 'answering'){
            console.log('hahahahahaha');            
          } else {
            sendApi.sendTarotFailureMessage(senderId, user)
          }
        break;
        case "PSY_TEST":
          console.log('psyTEst');
          // sendApi.sendTarotFailureMessage(senderId, user)
        break;
        default:
          sendApi.sendDontUnderstandMessage(senderId);
        break;
      }
    }
  } else {
    console.log('no nlp')
  }
};

const selectAnswer = async (senderId, yesOrNo) => {
  const user = await dataHelper.getUser(senderId);
  if(dataHelper.sayYesOrNo(user, yesOrNo)) {
    if(dataHelper.checkLast(user)) {
      sendApi.sendResultMessage(senderId, dataHelper.getDescription(user));
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

const handleNlpMessage = async (senderId, nlp) => {
  const datetime = firstEntityValue(nlp, "datetime");
  if(datetime) {
    const user = await dataHelper.getUser(senderId);
    if(nlp['datetime'][0].grain === 'day') { // 년/월/일까지 입력했을 경우 day
      
      const date = new Date(datetime);
      const tarotDate = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
      const tarotNumber = dataHelper.selectTarot(tarotDate);

      user.setState("status", "start");
      sendApi.sendTarotResultMessage(senderId, user, tarotNumber, dataHelper.getTarotData(tarotNumber));
    } else {
      sendApi.sendTarotFailureMessage(senderId, user)
    }
  }

  const intent = firstEntityValue(nlp, "intent");
  if(intent) {
    const user = await dataHelper.getUser(senderId);
    // const stateName = user.getState('stateName')
    switch(intent) {
      case "start_test":
        sendApi.sendWelcomeMessage(senderId, user);
      break;
      // case "positive":
      //   console.log('positive');
      //   if(stateName === 'PSY_TEST')
      //     selectAnswer(senderId, 'yes');
      // break;
      // case "negative":
      //   console.log('negative');
      //   if(stateName === 'PSY_TEST')
      //     selectAnswer(senderId, 'no');
      // break;
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

const handleQuickRepliesMessage = async (senderId, quick_reply) => {
  const { type } = JSON.parse(quick_reply.payload);
  let user = null;

  switch(type) {
    case 'SAY_TAROT_TEST':
      // store initializeCode
      user = await dataHelper.getUser(senderId);
      user.setState("name", "TAROT");
      sendApi.sendSayStartTarotMessage(senderId, user);
    break;
    case 'SAY_START_TEST':
      // store initializeCode
      user = await dataHelper.getUser(senderId);
      dataHelper.setPsyTest(user, true);
      sendApi.sendSayStartTestMessage(senderId, dataHelper.getDescription(user));
    break;
    case 'SAY_STOP_TEST':
      sendApi.sendSayStopTestMessage(senderId);
    break;
    default:
      console.log('default, ', type);
    break;
  }
}

const handleTestReceive = async (message, senderId) => {
  console.log('message, ', message);
  dataHelper.getTarotData();
  if(message.text === '111') {
    sendApi.sendTestText(senderId);
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