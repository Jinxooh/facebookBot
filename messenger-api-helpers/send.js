// ===== LODASH ================================================================
import castArray from 'lodash/castArray';
import concat from 'lodash/concat';
// ===== MESSENGER =============================================================
import api from './api';
import messages from './messages';
import { USER_STATE_STAR } from './dataHelper';

const CHATTING_SPEED = process.env.BOT_DEV_ENV === 'dev' ? 500 : 1000;

// Turns typing indicator on.
const typingOn = (recipientId) => {
  return {
    recipient: {
      id: recipientId,
    },
    sender_action: 'typing_on', // eslint-disable-line camelcase
  };
};

// Turns typing indicator off.
const typingOff = (recipientId) => {
  return {
    recipient: {
      id: recipientId,
    },
    sender_action: 'typing_off', // eslint-disable-line camelcase
  };
};

// Wraps a message json object with recipient information.
const messageToJSON = (recipientId, messagePayload) => {
  return {
    recipient: {
      id: recipientId,
    },
    message: messagePayload,
  };
};

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

// Send one or more messages using the Send API.
const sendMessage = async (recipientId, messagePayloads) => {
  const arr = castArray(messagePayloads);

  // 대화 하는것 처럼 지연을 주기위해서
  const start = async () => {
    await asyncForEach(arr, async (item) => {
      await api.callAsyncMessagesAPI(CHATTING_SPEED, typingOn(recipientId));
      await api.callAsyncMessagesAPI(CHATTING_SPEED, messageToJSON(recipientId, item));
    });
    api.callAsyncMessagesAPI(300, typingOff(recipientId));
  };
  await start();
};


// Send a read receipt to indicate the message has been read
const sendReadReceipt = (recipientId) => {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    sender_action: 'mark_seen', // eslint-disable-line camelcase
  };

  api.callMessagesAPI(messageData);
};

const sendWelcomeMessage = async (recipientId) => {
  await sendMessage(
    recipientId,
    messages.welcomeMessage,
  );
};

// Send a different Welcome message based on if the user is logged in.
const sendStartMessage = async (recipientId) => {
  await sendMessage(
    recipientId,
    concat(
      messages.startMessage,
      messages.startReplies,
    ),
  );
};

const sendTwoButtonMessage = (recipientId, { questionDescription }, user) => {
  sendMessage(
    recipientId,
    messages.psyTestReplies(questionDescription, user),
  );
};

const sendResultMessage = async (recipientId, result, user) => {
  await sendMessage(
    recipientId,
    messages.psyTestResultMessage(user, result),
  );
};

const sendSuggestRestartMessage = (recipientId) => {
  sendMessage(
    recipientId,
    messages.requestRestartMessage,
  );
};

const sendStartStarTestMessage = (recipientId, user) => {
  sendMessage(
    recipientId,
    messages.startStarTestMessage(user),
  );
};

const sendStarResultMessage = async (recipientId, starTestData, current = 0) => {
  const result = starTestData[current];
  const index = current + 2;
  const last = starTestData && index > starTestData.length;
  console.log(last);
  console.log(index);
  console.log(starTestData.length);

  await sendMessage(
    recipientId,
    concat(
      messages.starResultMessage(result),
      !last && messages.starTestReplies(starTestData[current + 1], { starTestData, index }),
      last && messages.starLastResultMessage,
      last && messages.sendShareButton(recipientId),
      last && messages.reviewReplies('REVIEWING', USER_STATE_STAR),
    ),
  );
};

const sendReviewReply = async (recipientId, stateName) => {
  await sendMessage(
    recipientId,
    messages.reviewReplies('REVIEWING', stateName),
  );
};

const sendLastResultMessage = async (recipientId) => {
  await sendMessage(
    recipientId,
    concat(
      messages.starLastResultMessage,
      messages.sendShareButton(recipientId),
    ),
  );
};

const sendStartTarotMessage = (recipientId, user) => {
  sendMessage(
    recipientId,
    messages.startTarotMessage(user),
  );
};

const sendTarotResultMessage = async (recipientId, user, tarotNumber, tarotData) => {
  user.setValue({ state: { retries: 0 } });
  await sendMessage(
    recipientId,
    concat(
      messages.tarotProcessMessage(user),
      messages.sendTarotImageMessage(tarotNumber),
      messages.tarotResultMessage(user, tarotData),
    ),
  );
};

const sendResultThanksMessage = async (recipientId) => {
  await sendMessage(
    recipientId,
    concat(
      messages.answerThanksMessage(),
      messages.sendImageMessage('/media/jadoo.png'),
      messages.requestRestartMessage,
    ),
  );
};

const sendTarotFailureMessage = (recipientId, user) => {
  const { retries } = user.state;
  user.setValue({ state: { retries: retries + 1 } });
  sendMessage(
    recipientId,
    retries > 1 ? messages.tarotAnswerFailure3times(user) : messages.tarotAnswerFailure(user),
  );
};

const sendStartPsyTestMessage = (recipientId, { psyTestDescription, questionDescription }, user) => {
  sendMessage(
    recipientId,
    [
      messages.sayStartTestMessage(psyTestDescription),
      messages.psyTestReplies(questionDescription, user),
    ],
  );
};

// get User Profile from facebook Reference
// https://developers.facebook.com/docs/messenger-platform/identity/user-profile
const sendGetUserProfile = (recipientId) => {
  return api.callPsidAPI(recipientId);
};

const sendSayHiMessage = (recipientId) => {
  // 랜덤한 인사말을 위해서
  sendMessage(
    recipientId,
    messages.sendSayHiMessage[Math.floor(Math.random() * messages.sendSayHiMessage.length)],
  );
};

const sendNiceMeetMessage = (recipientId) => {
  sendMessage(
    recipientId,
    messages.sendNiceMeetMessage[Math.floor(Math.random() * messages.sendNiceMeetMessage.length)],
  );
};


const sendDontUnderstandMessage = async (recipientId) => {
  await sendMessage(
    recipientId,
    [
      messages.sendDontUnderstandMessage[Math.floor(Math.random() * messages.sendDontUnderstandMessage.length)],
      messages.requestRestartMessage,
    ],
  );
};

const sendShareButton = (recipientId) => {
  sendMessage(
    recipientId,
    messages.sendShareButton(recipientId),
  );
};


export default {
  // basic
  sendMessage,
  sendReadReceipt,

  sendWelcomeMessage,
  sendStartMessage,

  sendStartStarTestMessage,
  sendStarResultMessage,
  sendLastResultMessage,

  sendStartTarotMessage,
  sendTarotResultMessage,
  sendResultThanksMessage,
  sendTarotFailureMessage,

  sendStartPsyTestMessage,

  sendTwoButtonMessage,
  sendResultMessage,
  sendSuggestRestartMessage,

  sendGetUserProfile,

  sendReviewReply,
  // nlp
  sendSayHiMessage,
  sendNiceMeetMessage,
  sendDontUnderstandMessage,

  sendShareButton,
};
