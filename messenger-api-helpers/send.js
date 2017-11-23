// ===== LODASH ================================================================
import castArray from 'lodash/castArray';
import isEmpty from 'lodash/isEmpty';

// ===== MESSENGER =============================================================
import api from './api';
import messages from './messages';

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

// Send one or more messages using the Send API.
const sendMessage = (recipientId, messagePayloads) => {
  console.log('sendMessage');
  const messagePayloadArray = castArray(messagePayloads)
    .map((messagePayload) => messageToJSON(recipientId, messagePayload));

  api.callMessagesAPI(
    [
      typingOn(recipientId),
      ...messagePayloadArray,
      typingOff(recipientId),
    ]);
};

// Send a read receipt to indicate the message has been read
const sendReadReceipt = (recipientId) => {
  console.log('sendReadReceipt');
  const messageData = {
    recipient: {
      id: recipientId,
    },
    sender_action: 'mark_seen', // eslint-disable-line camelcase
  };

  api.callMessagesAPI(messageData);
};

// Send a different Welcome message based on if the user is logged in.
const sendWelcomeMessage = (recipientId, userInfo) => {
  sendMessage(
    recipientId,
    [
      messages.welcomeMessage(userInfo),
      messages.welcomeReplies,
    ]);
};

const sendEchoMessage = (recipientId, message) => {
  sendMessage(
    recipientId,
    [
      {text: `Echo: ${message}❤️` }
    ]);
};

const sendChooseItemsMessage = (recipientId) => {
  sendMessage(
    recipientId,
    [
      messages.itemOptionsText,
      messages.itemOptionsCarosel(recipientId),
    ]);
};

const sendTwoButtonMessage = (recipientId, description) => {
  sendMessage(
    recipientId,
    messages.twoButtonMessage(description)
  );
};

const sendResultMessage = (recipientId, message) => {
  sendMessage(
    recipientId,
    [
      {text: `${message}` },
      messages.testResultMessage
    ]);
};

const sendSuggestRestartMessage = (recipientId) => {
  sendMessage(
    recipientId,
    messages.testResultMessage
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

const sendSayStopTestMessage = (recipientId) => {
  sendMessage(
    recipientId,
    messages.sayStopTestMessage
  );
}

// get User Profile from facebook Reference 
// https://developers.facebook.com/docs/messenger-platform/identity/user-profile
const sendGetUserProfile = async (recipientId) => {
  return await api.callPsidAPI(recipientId);
}

const sendImageMessage = (recipientId) => {
  sendMessage(recipientId, messages.sendImageMessage);
};

export default {
  // basic
  sendMessage,
  sendReadReceipt,
  sendEchoMessage,

  // functiioanl
  sendWelcomeMessage,

  sendSayStartTestMessage,
  sendSayStopTestMessage,

  sendTwoButtonMessage,
  sendResultMessage,
  sendChooseItemsMessage,
  sendSuggestRestartMessage,

  sendGetUserProfile,
  
  // test
  sendImageMessage,
};