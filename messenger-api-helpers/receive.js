// modules
import sendApi from './send';
import dataHelper from './database';
import isEmpty from 'lodash/isEmpty';

import {
  GET_STARTED,
  USER_STATE_TAROT,
  USER_STATE_PSY,
  USER_STATUS_INIT,
  USER_STATUS_START,
  USER_STATUS_PROCESS,
  USER_STATUS_ANSWERING,
  USER_STATUS_DONE,
} from './database'

const handleReceivePostback = async(event) => {
  const {
    type,
    data
  } = JSON.parse(event.postback.payload);
  const senderId = event.sender.id;
  let yesOrNo = null;

  switch (type) {
    case GET_STARTED:
      const user = await dataHelper.getUser(senderId);
      user.setValue({
        state: {
          stateName: type,
          status: USER_STATUS_PROCESS
        }
      });
      await sendApi.sendWelcomeMessage(senderId, user);
      user.setValue({
        state: {
          status: USER_STATUS_DONE
        }
      });
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

const handleReceiveMessage = async(event) => {
  const message = event.message;
  const senderId = event.sender.id;

  if (process.env.BOT_DEV_ENV === 'dev') {
    handleTestReceive(message, senderId)
  }

  if (message.quick_reply) {
    const {
      quick_reply
    } = message;
    handleQuickRepliesMessage(senderId, quick_reply);
    return;
  }

  if (message.nlp) {
    handleNlpMessage(senderId, message, event)
  }

  if (message.sticker_id) {
    handleStickerMessage(senderId, message);
  }

  sendApi.sendReadReceipt(senderId);
};

const selectAnswer = async(senderId, yesOrNo) => {
  const user = await dataHelper.getUser(senderId);
  const {
    stateName,
    status
  } = user.state;
  if (dataHelper.sayYesOrNo(user, yesOrNo)) {
    if (dataHelper.checkLast(user)) {
      await sendApi.sendResultMessage(senderId, dataHelper.getDescription(user), user);
      user.setValue({
        state: {
          status: USER_STATUS_ANSWERING
        }
      });
    } else {
      sendApi.sendTwoButtonMessage(senderId, dataHelper.getDescription(user));
    }
  } else {
    // click postback when test is done
    if (status === USER_STATUS_ANSWERING)
      reviewResult(senderId, user, `${stateName}:${yesOrNo}`);
    else
      sendApi.sendSuggestRestartMessage(senderId);
  }
}

const reviewResult = async(senderId, user, reviewMessage) => {
  dataHelper.saveReview(senderId, user, reviewMessage);
  await sendApi.sendResultThanksMessage(senderId);
  user.setValue({
    state: {
      status: USER_STATUS_INIT
    }
  });
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
  let {
    stateName,
    status
  } = user.state;
  if (status === USER_STATUS_ANSWERING) {
    // 369239263222822 -> 따봉
    reviewResult(senderId, user, `${stateName}:${message.sticker_id}`);
  } else {
    user.setValue({ state: { status: USER_STATUS_PROCESS }});
    await sendApi.sendDontUnderstandMessage(senderId);
  }
  user.setValue({ state: { status: USER_STATUS_DONE }});
}

// 자연어 입력 핸들
const handleNlpMessage = async(senderId, message, event) => {
  const user = await dataHelper.getUser(senderId);
  let {
    stateName,
    status
  } = user.state;
  const nlp = message.nlp.entities;

  if (status === USER_STATUS_PROCESS) {
    // 자두야 놀자 커맨드 여러번 입력 안되게 수정
    if (!isEmpty(nlp)) {
      const self = firstEntityValue(nlp, "self");
      const play = firstEntityValue(nlp, "play");
      if (self && play) return;
    }
    user.pushUserQueue(event);
    return;
  }

  if (!isEmpty(nlp)) {
    const self = firstEntityValue(nlp, "self");
    const play = firstEntityValue(nlp, "play");
    if (self && play) {
      user.setValue({
        state: {
          status: USER_STATUS_PROCESS,
          stateName: GET_STARTED
        }
      });
      await sendApi.sendWelcomeMessage(senderId, user);
    }
    const select = stateName === GET_STARTED && firstEntityValue(nlp, "select_test");
    if (select) {
      switch (select) {
        case 'first':
          user.setValue({
            state: {
              status: USER_STATUS_START,
              stateName: USER_STATE_TAROT
            }
          });
          sendApi.sendSayStartTarotMessage(senderId, user);
          break;
        case 'second':
          dataHelper.setPsyTest(user, true);
          sendApi.sendSayStartTestMessage(senderId, dataHelper.getDescription(user));
          break;
        default:
          console.log('unknown select test :', select);
          break;
      }
    }

    const datetime = stateName === USER_STATE_TAROT && firstEntityValue(nlp, "datetime");
    if (datetime) {
      if (nlp['datetime'][0].grain === 'day') { // 년/월/일까지 입력했을 경우 day
        const date = new Date(datetime);
        const KSTdate = new Date(date.toUTCString());
        KSTdate.setTime(KSTdate.getTime() + (9 * 3600 * 1000)); // gmt + 9h = kst

        const tarotDate = `${KSTdate.getFullYear()}${KSTdate.getMonth() + 1}${KSTdate.getDate()}`;
        const tarotNumber = dataHelper.selectTarot(tarotDate);

        user.setValue({
          state: {
            status: USER_STATUS_PROCESS,
            retries: 0
          }
        });
        await sendApi.sendTarotResultMessage(senderId, user, tarotNumber, dataHelper.getTarotData(tarotNumber));
        user.setValue({
          state: {
            status: USER_STATUS_ANSWERING
          }
        });
      } else {
        sendApi.sendTarotFailureMessage(senderId, user)
      }
    }


    const greeting = firstEntityValue(nlp, "greeting");
    if (greeting) {
      switch (greeting) {
        case "say_hi":
          sendApi.sendSayHiMessage(senderId);
          break;
        case "nice_meet":
          sendApi.sendNiceMeetMessage(senderId);
          break;
      }
    }

  } else {
    user.setValue({
      state: {
        status: USER_STATUS_PROCESS,
      }
    });
    switch (stateName) {
      case GET_STARTED:
        await sendApi.sendDontUnderstandMessage(senderId);
        break;
      case USER_STATE_TAROT:
        if (status === USER_STATUS_ANSWERING) {
          // review
          reviewResult(senderId, user, `${stateName}:${message.text}`);
        } else if (status === USER_STATUS_INIT) {
          await sendApi.sendDontUnderstandMessage(senderId);
        } else {
          sendApi.sendTarotFailureMessage(senderId, user)
        }
        break;
      case USER_STATE_PSY:
        if (status === USER_STATUS_ANSWERING) {
          // review
          reviewResult(senderId, user, `${stateName}:${message.text}`);
        } else
          await sendApi.sendDontUnderstandMessage(senderId);
        break;
      default:
        await sendApi.sendDontUnderstandMessage(senderId);
        break;
    }
  }

  status = user.state.status;
  const [eventObject, ...userQueue] = user.userQueue;
  if (eventObject) {
    if (userQueue) user.setValue({
      userQueue
    });
    user.setValue({
      state: status !== USER_STATUS_ANSWERING ? {
        status: USER_STATUS_START
      } : {
        status
      }
    });
    handleReceiveMessage(eventObject);
    return;
  }
  if (status !== USER_STATUS_ANSWERING && status !== USER_STATUS_INIT) {
    user.setValue({
      state: {
        status: USER_STATUS_DONE
      }
    });
  }
}

const handleQuickRepliesMessage = async(senderId, quick_reply) => {
  const { type } = JSON.parse(quick_reply.payload);
  let user = null;

  switch (type) {
    case 'SAY_TAROT_TEST':
      // store initializeCode
      user = await dataHelper.getUser(senderId);
      user.setValue({
        state: {
          status: USER_STATUS_START,
          stateName: USER_STATE_TAROT
        }
      });
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

const handleTestReceive = async(message, senderId) => {
  // console.log('senderId, ', senderId);
  dataHelper.getTarotData();
  if (message.text === '111') {
    sendApi.sendShareButton(senderId);
    return true;
  }


  if (message.text === '222') {
    sendApi.sendAnswerTarotResultMessage(senderId, "lol");
    return true;
  }

  if (message.text === '333') {
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