// modules
import isEmpty from 'lodash/isEmpty';
import sendApi from './send';

import dataHelper, {
  GET_STARTED,
  USER_STATE_TAROT,
  USER_STATE_STAR,
  MESSAGE_PROCESS, // 진행중인 상태

  MODE_NORMAL,
  MODE_DATE,
  MODE_REVIEW,
} from './dataHelper';

const handleReceivePostback = async (event) => {
  const {
    type,
  } = JSON.parse(event.postback.payload);
  const senderId = event.sender.id;
  switch (type) {
    case GET_STARTED:
      dataHelper.getUser(senderId); // DB에 유저 추가
      sendApi.sendWelcomeMessage(senderId);
      break;
    default:
      console.error(`Unknown Postback called: ${type}`);
      break;
  }
};

const reviewResult = async (senderId, user, reviewMessage) => {
  dataHelper.saveReview(senderId, user, reviewMessage);
  await sendApi.sendResultThanksMessage(senderId);
  user.setValue({ modes: MODE_NORMAL });
};

const handleStickerMessage = async (senderId, message) => {
  const user = await dataHelper.getUser(senderId);
  const { stateName, modes } = user;

  if (modes === MODE_REVIEW) {
    // 369239263222822 -> 따봉
    reviewResult(senderId, user, `${stateName}:${message.sticker_id}`);
  } else {
    await sendApi.sendDontUnderstandMessage(senderId);
  }
};

// 자연어 입력 핸들
const handleNlpMessage = async (senderId, message) => {
  const user = await dataHelper.getUser(senderId);
  const { stateName, messageStatus, modes } = user;

  const nlp = message.nlp.entities;

  if (messageStatus === MESSAGE_PROCESS) {
    // 자두야 놀자 커맨드 여러번 입력 안되게 수정
    return;
  }

  if (!isEmpty(nlp)) {
    const self = dataHelper.firstEntityValue(nlp, 'self');
    const play = dataHelper.firstEntityValue(nlp, 'play');
    if (self && play) {
      user.setValue({ stateName: GET_STARTED, modes: MODE_NORMAL });
      await sendApi.sendStartMessage(senderId);
    }

    const select = stateName === GET_STARTED && dataHelper.firstEntityValue(nlp, 'select_test');
    if (select) {
      switch (select) {
        case 'first':
          user.setValue({ stateName: USER_STATE_STAR, modes: MODE_DATE });
          sendApi.sendStartStarTestMessage(senderId, user);
          break;
        case 'second':
          user.setValue({ stateName: USER_STATE_TAROT, modes: MODE_DATE });
          sendApi.sendStartTarotMessage(senderId, user);
          break;
        default:
          console.log('unknown select test :', select);
          break;
      }
    }

    const datetime = modes === MODE_DATE && dataHelper.firstEntityValue(nlp, 'datetime');
    if (datetime) {
      if (nlp.datetime[0].grain === 'day') { // 년/월/일까지 입력했을 경우 day
        const date = new Date(datetime);
        const KSTdate = new Date(date.toUTCString());
        KSTdate.setTime(KSTdate.getTime() + (9 * 3600 * 1000)); // gmt + 9h = kst

        user.setValue({ retries: 0 }); // retry 초기화
        if (stateName === USER_STATE_TAROT) {
          const tarotDate = `${KSTdate.getFullYear()}${KSTdate.getMonth() + 1}${KSTdate.getDate()}`;
          const tarotNumber = dataHelper.selectTarot(tarotDate);
          await sendApi.sendTarotResultMessage(senderId, user, tarotNumber, dataHelper.getTarotData(tarotNumber));
          await sendApi.sendReviewReply(senderId, stateName);
          user.setValue({ modes: MODE_REVIEW });
        }
        if (stateName === USER_STATE_STAR) {
          const { starName, starNumber } = dataHelper.selectStarTest(KSTdate.getMonth(), KSTdate.getDate());
          await sendApi.sendStarResultMessage(senderId, {
            starName, starNumber, stateName,
          }, user);
          user.setValue({ modes: MODE_NORMAL });
        }
      } else {
        sendApi.sendTarotFailureMessage(senderId, user);
      }
    }


    const greeting = dataHelper.firstEntityValue(nlp, 'greeting');
    if (greeting) {
      switch (greeting) {
        case 'say_hi':
          sendApi.sendSayHiMessage(senderId);
          break;
        case 'nice_meet':
          sendApi.sendNiceMeetMessage(senderId);
          break;
        default:
          break;
      }
    }
  } else {
    switch (modes) {
      case MODE_NORMAL:
        await sendApi.sendDontUnderstandMessage(senderId);
        break;
      case MODE_DATE:
        // should change to DATE FAILURE MESSAGE
        sendApi.sendTarotFailureMessage(senderId, user);
        break;
      case MODE_REVIEW:
        reviewResult(senderId, user, `${stateName}:${message.text}`);
        break;
      default:
        console.log('default, ', modes);
        await sendApi.sendDontUnderstandMessage(senderId);
        break;
    }
  }
};

const handleQuickRepliesMessage = async (senderId, quick_reply) => {
  const { type, data } = JSON.parse(quick_reply.payload);
  const user = await dataHelper.getUser(senderId);

  switch (type) {
    case MODE_REVIEW:
      reviewResult(senderId, user, data);
      break;
    case 'STAR_ANSWER_NO':
      await sendApi.sendLastResultMessage(senderId, data);
      sendApi.sendReviewReply(senderId, 'STAR_TEST');
      break;
    case 'STAR_ANSWER_YES':
      await sendApi.sendStarResultMessage(senderId, data, user);
      break;
    case USER_STATE_STAR:
      user.setValue({ stateName: USER_STATE_STAR, modes: MODE_DATE });
      sendApi.sendStartStarTestMessage(senderId, user);
      break;
    case USER_STATE_TAROT:
      user.setValue({ stateName: USER_STATE_TAROT, modes: MODE_DATE });
      sendApi.sendStartTarotMessage(senderId, user);
      break;
    // case 'PSY_ANSWER':
    //   selectAnswer(senderId, data);
    //   break;
    // case USER_STATE_PSY:
    //   dataHelper.setPsyTest(user, true);
    //   sendApi.sendStartPsyTestMessage(senderId, dataHelper.getDescription(user), user);
    //   break;
    default:
      console.log('default, ', type);
      break;
  }
};

// const selectAnswer = async (senderId, next) => {
//   const user = await dataHelper.getUser(senderId);
//   const { stateName, modes } = user;

//   user.setValue({ next });
//   if (next) {
//     user.setValue({ current: next });
//     const { result } = dataHelper.getQustionData(user);
//     if (result) {
//       await sendApi.sendResultMessage(senderId, result, user);
//       user.setValue({ modes: MODE_REVIEW });
//     } else {
//       sendApi.sendTwoButtonMessage(senderId, dataHelper.getDescription(user), user);
//     }
//   } else {
//     if (modes === MODE_REVIEW) {
//       reviewResult(senderId, user, `${stateName}:${next}`);
//     } else {
//       sendApi.sendSuggestRestartMessage(senderId);
//     }
//   }
// };

const handleTestReceive = async (message, senderId) => {
  if (message.text === '11') {
    const user = await dataHelper.getUser(senderId);
    user.setValue({ modes: MODE_DATE });
    return true;
  }

  if (message.text === '22') {
    const userInfo = await sendApi.sendGetUserProfile(senderId);
    console.log('userINFO ', userInfo);
    return true;
  }

  if (message.text === '33') {
    return true;
  }

  return false;
};

const handleReceiveMessage = async (event) => {
  const { message } = event;
  const senderId = event.sender.id;

  if (process.env.BOT_DEV_ENV === 'dev') {
    handleTestReceive(message, senderId);
  }

  if (message.quick_reply) {
    const { quick_reply } = message;
    handleQuickRepliesMessage(senderId, quick_reply);
    return;
  }

  if (message.nlp) {
    handleNlpMessage(senderId, message, event);
  }

  if (message.sticker_id) {
    handleStickerMessage(senderId, message);
  }

  sendApi.sendReadReceipt(senderId);
};

export default {
  handleReceivePostback,
  handleReceiveMessage,
};
