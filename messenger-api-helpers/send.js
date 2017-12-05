// ===== LODASH ================================================================
import castArray from 'lodash/castArray';
import isEmpty from 'lodash/isEmpty';
import isArray from 'lodash/isArray';
import concat from 'lodash/concat';
import reduce from 'lodash/reduce';
// ===== MESSENGER =============================================================
import api from './api';
import messages from './messages';

import {
  USER_RETRIES,
} from './database'

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
    await callback(array[index], index, array)
  }
}

// Send one or more messages using the Send API.
const sendMessage = async (recipientId, messagePayloads) => {
  const arr = castArray(messagePayloads);
  
  // 대화 하는것 처럼 지연을 주기위해서
  const start = async () => {
    await asyncForEach(arr, async (item) => {
      await api.callAsyncMessagesAPI(1000, typingOn(recipientId));
      await api.callAsyncMessagesAPI(1000, messageToJSON(recipientId, item))
    })
    api.callAsyncMessagesAPI(300, typingOff(recipientId));
  }
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

// Send a different Welcome message based on if the user is logged in.
const sendWelcomeMessage = async (recipientId, userInfo) => {
  await sendMessage(
    recipientId,
    concat(
      messages.welcomeMessage(userInfo),
      messages.welcomeReplies,
    ));
};

const sendTwoButtonMessage = (recipientId, { questionDescription }) => {
  sendMessage(
    recipientId,
    messages.twoButtonMessage(questionDescription)
  );
};

const sendResultMessage = (recipientId, { questionDescription }) => {
  let text;
  // 메세지가 배열로 올경우 나눠서 전달하기 위해 
  // 나중에 전체로 빼야할듯
  if(isArray(questionDescription))
    text = reduce(questionDescription, (result, item, index) => {
      result[index] = {text: item};
      return result;
    }, []);
  else 
    text = {text: questionDescription};

  sendMessage(
    recipientId,
    concat(
      text, 
      messages.answerThanksMessage(), 
      messages.sendImageMessage('/media/jadoo.png'), 
      messages.requestRestartMessage
    )
  );
};

const sendSuggestRestartMessage = (recipientId) => {
  
    sendMessage(
      recipientId,
      messages.requestRestartMessage,
    )
  }

const sendSayStartTarotMessage = (recipientId, user) => {
  sendMessage(
    recipientId,
    concat(messages.sayStartTarotMessage(user))
  );
}

const sendTarotResultMessage = async (recipientId, user, tarotNumber, tarotData) => {
  user.setState(USER_RETRIES, 0);
  await sendMessage(
    recipientId,
    concat(
      messages.tarotProcessMessage(user),
      messages.sendTarotImageMessage(tarotNumber),
      messages.tarotResultMessage(user, tarotData)
    )
  )
}

const sendAnswerTarotResultMessage = async (recipientId, message) => {
  await sendMessage(
    recipientId,
    messages.thanksMessage,
  )
  await sendMessage(
    recipientId,
    messages.answerThanksMessage(),
  )
  await sendMessage(
    recipientId,
    [
      messages.sendImageMessage('/media/jadoo.png'),
      messages.requestRestartMessage,
    ]
  )
}

const sendTarotFailureMessage = (recipientId, user) => {
    const { retries } = user.getState();
    user.setState(USER_RETRIES, retries + 1);
    sendMessage(
      recipientId,
      retries > 1 ? messages.tarotAnswerFailure3times(user) : messages.tarotAnswerFailure(user)
    )
  }

const sendSayStartTestMessage = (recipientId, {psyTestDescription, questionDescription}) => {
  sendMessage(
    recipientId,
    [
      messages.sayStartTestMessage(psyTestDescription),
      messages.twoButtonMessage(questionDescription)
    ]
  );
}

// get User Profile from facebook Reference 
// https://developers.facebook.com/docs/messenger-platform/identity/user-profile
const sendGetUserProfile = async (recipientId) => {
  return await api.callPsidAPI(recipientId);
}

const sendSayHiMessage = (recipientId) => {
  // 랜덤한 인사말을 위해서
  sendMessage(
    recipientId,
    messages.sendSayHiMessage[Math.floor(Math.random() * messages.sendSayHiMessage.length)]
  );
}

const sendNiceMeetMessage = (recipientId) => {
  sendMessage(
    recipientId,
    messages.sendNiceMeetMessage[Math.floor(Math.random() * messages.sendNiceMeetMessage.length)]
  );
}


const sendDontUnderstandMessage = (recipientId) => {
  sendMessage(
    recipientId,
    messages.sendDontUnderstandMessage[Math.floor(Math.random() * messages.sendDontUnderstandMessage.length)]
  );
}

const sendShareButton = (recipientId) => {
  sendMessage(
    recipientId,
    messages.sendShareButton(recipientId)
  );
}


export default {
  // basic
  sendMessage,
  sendReadReceipt,

  // functiioanl
  sendWelcomeMessage,

  sendSayStartTarotMessage,
  sendTarotResultMessage,
  sendAnswerTarotResultMessage,
  sendTarotFailureMessage,

  sendSayStartTestMessage,

  sendTwoButtonMessage,
  sendResultMessage,
  sendSuggestRestartMessage,

  sendGetUserProfile,

  // nlp
  sendSayHiMessage,
  sendNiceMeetMessage,
  sendDontUnderstandMessage,

  sendShareButton,
};