// ===== LODASH ================================================================
import castArray from 'lodash/castArray';
import concat from 'lodash/concat';
// ===== MESSENGER =============================================================
import api from './api';
import messages from './messages';
import dataHelper, { MODE_REVIEW, MESSAGE_PROCESS, MESSAGE_DONE } from './dataHelper';

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
    messaging_type: 'UPDATE',
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
  const user = await dataHelper.getUser(recipientId);
  user.setValue({ messageStatus: MESSAGE_PROCESS });
  // 대화 하는것 처럼 지연을 주기위해서
  const start = async () => {
    await asyncForEach(arr, async (item) => {
      await api.callAsyncMessagesAPI(CHATTING_SPEED, typingOn(recipientId));
      await api.callAsyncMessagesAPI(CHATTING_SPEED, messageToJSON(recipientId, item));
    });
    api.callAsyncMessagesAPI(300, typingOff(recipientId));
  };
  await start();
  user.setValue({ messageStatus: MESSAGE_DONE });
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

const sendResultMessage = async (recipientId, result, user, stateName) => {
  await sendMessage(
    recipientId,
    concat(
      messages.psyTestResultMessage(user, result),
      messages.reviewReplies(MODE_REVIEW, stateName),
    ),
  );
};

const sendSuggestRestartMessage = (recipientId) => {
  sendMessage(
    recipientId,
    messages.requestRestartMessage,
  );
};

// 별자리 테스트 시작
const sendStartStarTestMessage = (recipientId, user) => {
  sendMessage(
    recipientId,
    messages.startStarTestMessage(user),
  );
};

// 별자리 테스트 결과
const sendStarResultMessage = async (recipientId, data, user) => {
  const {
    starName, starNumber, stateName, index = 0,
  } = data;
  const { first_name } = user;
  const starData = dataHelper.getStarData();
  const starTestData = starData[starNumber];
  const result = starTestData[index];
  const description = [
    `★2018’ 별자리 운세★
♒ 물병자리 
2018’ Key word: 성공
Best Month: 5월~8월 
Best Color: 노랑색, 주황색`, `★2018’ 별자리 운세★
♓ 물고기자리
2018’ Key word: 여행
Best Month: 11월 
Best Color: 금색(Gold)`, `★2018’ 별자리 운세★
♈ 양자리
2018’ Key word: 도전
Best Month: 7월, 12월
Best Color: 남보라색`, `★2018’ 별자리 운세★
♉ 황소자리
2018’ Key word: 네트워크
Best Month: 4월, 9월 
Best Color: 브라운`, `★2018’ 별자리 운세★
♊ 쌍둥이자리 
2018’ Key word: 변화
Best Month: 4월, 6월
Best Color: 초록색`, `★2018’ 별자리 운세★
♋ 게자리
2018’ Key word: 창조
Best Month: 9월
Best Color: 은색(Silver)`, `★2018’ 별자리 운세★
♌ 사자자리
2018’ Key word: 시작
Best Month: 1월, 2월
Best Color: 빨강색`, `★2018’ 별자리 운세★
♍ 처녀자리
2018’ Key word: 자유
Best Month: 6월
Best Color: 스카이블루`, `★2018’ 별자리 운세★
♎ 천칭자리
2018’ Key word: 풍요
Best Month: 4월, 5월
Best Color: 핑크색, 노란색`, `★2018’ 별자리 운세★
♏ 전갈자리
2018’ Key word: 전환
Best Month: 5월
Best Color: 오랜지색, 보라색`, `★2018’ 별자리 운세★
♐ 사수자리
2018’ Key word: 수확
Best Month: 4월, 8월
Best Color: 회색, 남색 `, `★2018’ 별자리 운세★
♑ 염소자리
2018’ Key word: 가능성
Best Month: 3월, 9월
Best Color: 민트색, 보라색`,
  ];

  const last = starTestData && (index + 2) > starTestData.length;
  let message = null;

  if (last) {
    message = concat(
      messages.sendImageMessage(`media/star-images/words/${starNumber}.jpg`),
      messages.starResultMessage(result),
      messages.sendShareButton(starNumber, description[starNumber]),
      messages.requestLike(),
      messages.reviewReplies(MODE_REVIEW, stateName),
    );

    user.setValue({ modes: MODE_REVIEW });
  } else {
    message = concat(
      messages.starResultMessage(result, first_name, starName),
      messages.starTestReplies(starTestData[index + 1], {
        starName, starNumber, stateName, index: index + 2,
      }),
    );
  }

  await sendMessage(
    recipientId,
    message,
  );
};

const sendReviewReplyWithoutLike = async (recipientId, stateName) => {
  await sendMessage(
    recipientId,
    messages.reviewReplies(MODE_REVIEW, stateName),
  );
};

const sendReviewReply = async (recipientId, stateName) => {
  await sendMessage(
    recipientId,
    concat(
      messages.requestLike(),
      messages.reviewReplies(MODE_REVIEW, stateName),
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
  user.setValue({ retries: 0 });
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

const sendDateTypeFailureMessage = (recipientId, user) => {
  const { retries } = user;
  user.setValue({ retries: retries + 1 });
  sendMessage(
    recipientId,
    retries > 1 ? messages.answerFailure3times() : messages.answerFailure(),
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

const sendStartPsyTestMessage = (recipientId, { psyTestDescription, questionDescription }, user) => {
  sendMessage(
    recipientId,
    [
      messages.sayStartTestMessage(psyTestDescription),
      messages.psyTestReplies(questionDescription, user),
    ],
  );
};

const sendTwoButtonMessage = (recipientId, { questionDescription }, user) => {
  sendMessage(
    recipientId,
    messages.psyTestReplies(questionDescription, user),
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

  sendStartTarotMessage,
  sendTarotResultMessage,
  sendResultThanksMessage,
  sendDateTypeFailureMessage,

  // psy
  sendStartPsyTestMessage,
  sendTwoButtonMessage,

  sendResultMessage,
  sendSuggestRestartMessage,

  sendGetUserProfile,

  sendReviewReplyWithoutLike,
  sendReviewReply,
  // nlp
  sendSayHiMessage,
  sendNiceMeetMessage,
  sendDontUnderstandMessage,
};
