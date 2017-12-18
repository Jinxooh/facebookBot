// modules
import sendApi from './send';
import isEmpty from 'lodash/isEmpty';

import dataHelper, {
  GET_STARTED,
  USER_STATE_TAROT,
  USER_STATE_PSY,
  USER_STATE_STAR,
  USER_STATUS_INIT, // 초기값 
  USER_STATUS_START, // 진행중인 상태
  USER_STATUS_PROCESS, // 진행중인 상태
  USER_STATUS_ANSWERING, // 사용자 입력을 받는 상태 
  USER_STATUS_DONE, // 진행이 끝난 상태
} from './dataHelper';

const handleReceivePostback = async (event) => {
  const {
    type,
    data
  } = JSON.parse(event.postback.payload);
  const senderId = event.sender.id;
  let yesOrNo = null;
  switch (type) {
    case GET_STARTED:
      dataHelper.getUser(senderId); // DB에 유저 추가
      sendApi.sendWelcomeMessage(senderId);
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
      await sendApi.sendStartMessage(senderId);
    }

    const select = stateName === GET_STARTED && firstEntityValue(nlp, "select_test");
    if (select) {
      switch (select) {
        case 'first':
          user.setValue({
            state: {
              status: USER_STATUS_START,
              stateName: USER_STATE_STAR
            }
          });
          dataHelper.setStarTest(user);
          sendApi.sendStartStarTestMessage(senderId, user);
        break;
        case 'second':
          user.setValue({
            state: {
              status: USER_STATUS_START,
              stateName: USER_STATE_TAROT
            }
          });
          sendApi.sendStartTarotMessage(senderId, user);
          // dataHelper.setPsyTest(user, true);
          // sendApi.sendSayStartTestMessage(senderId, dataHelper.getDescription(user));
          break;
        default:
          console.log('unknown select test :', select);
          break;
      }
    }

    const checkState = (stateName === USER_STATE_TAROT || stateName === USER_STATE_STAR);
    const datetime = checkState && firstEntityValue(nlp, "datetime");
    if (datetime) {
      if (nlp['datetime'][0].grain === 'day') { // 년/월/일까지 입력했을 경우 day

        // should go helper
        const date = new Date(datetime);
        const KSTdate = new Date(date.toUTCString());
        KSTdate.setTime(KSTdate.getTime() + (9 * 3600 * 1000)); // gmt + 9h = kst

        user.setValue({
          state: {
            status: USER_STATUS_PROCESS,
            retries: 0
          }
        });
        if (stateName === USER_STATE_TAROT) {
          const tarotDate = `${KSTdate.getFullYear()}${KSTdate.getMonth() + 1}${KSTdate.getDate()}`;
          const tarotNumber = dataHelper.selectTarot(tarotDate);
          await sendApi.sendTarotResultMessage(senderId, user, tarotNumber, dataHelper.getTarotData(tarotNumber));
        }
        if (stateName === USER_STATE_STAR) {
          const starTestNumber = dataHelper.selectStarTest(KSTdate.getMonth(), KSTdate.getDate());
          const starData = dataHelper.getStarData();
          await sendApi.sendStarResultMessage(senderId, starData[starTestNumber]);
        }

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
      case USER_STATE_STAR:
        if (status === USER_STATUS_ANSWERING) {
          console.log('SHIT!!');
        } else if (status === USER_STATUS_INIT) {
          console.log('dont understand')
        } else {
          console.log('birthday re-enter')
          // sendApi.sendTarotFailureMessage(senderId, user)
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
  if (eventObject) { // 큐가 남아 있다면 나머지는 큐에 저장하고 다시 메세지 전달
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

  // 끝날때
  if (status !== USER_STATUS_ANSWERING && status !== USER_STATUS_INIT) {
    user.setValue({
      state: {
        status: USER_STATUS_DONE
      }
    });
  }
}

const handleQuickRepliesMessage = async (senderId, quick_reply) => {
  const { type, data } = JSON.parse(quick_reply.payload);
  const user = await dataHelper.getUser(senderId);
  user.setValue({
    state: {
      status: USER_STATUS_START,
      stateName: type
    }
  });
  switch (type) {
    case 'PSY_ANSWER':
      selectAnswer(senderId, data)
      break;
    case 'STAR_ANSWER_NO':
      const starData = dataHelper.getStarData();
      await sendApi.sendLastResultMessage(senderId, starData[starData.length - 1]);
      break;
    case 'STAR_ANSWER_YES':
      const { starTestData, index } = data;
      const last = index === starTestData.length - 1;
      if (last) {
        const starData = dataHelper.getStarData();
        await sendApi.sendStarResultMessage(senderId, starTestData, index, last);
        await sendApi.sendLastResultMessage(senderId, starData[starData.length - 1]);
      } else {
        await sendApi.sendStarResultMessage(senderId, starTestData, index);
      }
      break;
    case USER_STATE_STAR:
      dataHelper.setStarTest(user);
      sendApi.sendStartStarTestMessage(senderId, user);
      break;
    case USER_STATE_TAROT:
      sendApi.sendStartTarotMessage(senderId, user);
      break;
    case USER_STATE_PSY:
      dataHelper.setPsyTest(user, true);
      sendApi.sendStartPsyTestMessage(senderId, dataHelper.getDescription(user));
      break;
    default:
      console.log('default, ', type);
      break;
  }
}

const handleTestReceive = async(message, senderId) => {
  // console.log('senderId, ', senderId);
  dataHelper.getTarotData();
  if (message.text === '11') {
    // console.log(dataHelper.selectStarTest(11, 25));
    // console.log(dataHelper.getStarData(0));
    const user = await dataHelper.getUser(senderId);
    await sendApi.sendStarResultMessage(senderId, user, dataHelper.getStarData(0));
    return true;
  }


  if (message.text === '22') {
    sendApi.sendAnswerTarotResultMessage(senderId, "lol");
    return true;
  }

  if (message.text === '33') {
    const starData = dataHelper.getStarData();
    await sendApi.sendLastResultMessage(senderId, starData[starData.length - 1]);
    return true;
  }

  return false;
}

export default {
  handleReceivePostback,
  handleReceiveMessage,
}