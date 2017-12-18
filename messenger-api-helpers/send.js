// ===== LODASH ================================================================
import castArray from 'lodash/castArray';
import concat from 'lodash/concat';
// ===== MESSENGER =============================================================
import api from './api';
import messages from './messages';

const CHATTING_SPEED = process.env.BOT_DEV_ENV == 'dev' ? 10 : 1000;

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
      await api.callAsyncMessagesAPI(CHATTING_SPEED, typingOn(recipientId));
      await api.callAsyncMessagesAPI(CHATTING_SPEED, messageToJSON(recipientId, item))
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
    ));
};

const sendTwoButtonMessage = (recipientId, { questionDescription }) => {
  sendMessage(
    recipientId,
    messages.twoButtonMessage(questionDescription)
  );
};

const sendResultMessage = async (recipientId, { questionDescription }, user) => {
  await sendMessage(
    recipientId,
    messages.psyTestResultMessage(user, questionDescription)
  );
};

const sendSuggestRestartMessage = (recipientId) => { 
  sendMessage(
    recipientId,
    messages.requestRestartMessage,
  )
}

const sendStartStarTestMessage = (recipientId, user) => {
  sendMessage(
    recipientId,
    messages.startStarTestMessage(user)
  )
}

const sendStarResultMessage = async (recipientId, user, starTestData) => {
  let current = user.current;
  if (current === null) current = 0;

  const [description] = starTestData[current + 1];
  await sendMessage(
    recipientId,
    concat(
      messages.starResultMessage(starTestData[current]),
      messages.twoButtonMessage(description, true)
    )
  )
}

const sendLastResultMessage = async (recipientId, user, starTestData) => {
  let current = user.current;
  if (current === null) current = 0;

  const [description] = starTestData[current + 1];
  await sendMessage(
    recipientId,
    concat(
      messages.starResultMessage(starTestData[current]),
      messages.twoButtonMessage(description, true)
    )
  )
}

const sendStartTarotMessage = (recipientId, user) => {
  sendMessage(
    recipientId,
    messages.startTarotMessage(user)
  );
}

const sendTarotResultMessage = async (recipientId, user, tarotNumber, tarotData) => {
  user.setValue({ state: { retries: 0 }});
  await sendMessage(
    recipientId,
    concat(
      messages.tarotProcessMessage(user),
      messages.sendTarotImageMessage(tarotNumber),
      messages.tarotResultMessage(user, tarotData)
    )
  )
}

const sendResultThanksMessage = async (recipientId) => {
  await sendMessage(
    recipientId,
    concat(
      messages.answerThanksMessage(),
      messages.sendImageMessage('/media/jadoo.png'),
      messages.requestRestartMessage,
    )
  )
}

const sendTarotFailureMessage = (recipientId, user) => {
    const { retries } = user.state;
    user.setValue({ state: { retries: retries + 1 }});
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


const sendDontUnderstandMessage = async (recipientId) => {
  await sendMessage(
    recipientId,
    [
      messages.sendDontUnderstandMessage[Math.floor(Math.random() * messages.sendDontUnderstandMessage.length)],
      messages.requestRestartMessage
    ]
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

  sendWelcomeMessage,
  sendStartMessage,

  sendStartStarTestMessage,
  sendStarResultMessage,

  sendStartTarotMessage,
  sendTarotResultMessage,
  sendResultThanksMessage,
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