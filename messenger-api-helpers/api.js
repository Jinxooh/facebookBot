// lodash
import castArray from 'lodash/castArray';
import isEmpty from 'lodash/isEmpty';

// ===== MODULES ===============================================================
import fetch from 'node-fetch';

const PAGE_ACCESS_TOKEN = process.env.BOT_DEV_ENV === 'dev' ? process.env.TEST_PAGE_ACCESS_TOKEN : process.env.PAGE_ACCESS_TOKEN;
const RETRIES = 5;

const callAPI = (endPoint, messageDataArray, retries = RETRIES) => {
  // if (!messageDataArray.message) return;
  // Error if developer forgot to specify an endpoint to send our request to
  if (!endPoint) {
    console.error('callAPI requires you specify an endpoint.');
    return;
  }

  // Error if we've run out of retries.
  if (retries < 0) {
    console.error(
      'No more retries left.',
      {
        endPoint,
        messageDataArray,
      },
    );
    return;
  }

  const qs = `access_token=${encodeURIComponent(PAGE_ACCESS_TOKEN)}`;
  const [messageToSend, ...queue] = castArray(messageDataArray);
  const body = JSON.stringify(messageToSend);
  fetch(`https://graph.facebook.com/v2.6/me/${endPoint}?${qs}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
    .then(rsp => rsp.json())
    .then((json) => {
    // console.log(json);
      if (json.error && json.error.message) {
        console.error(`Retrying Request: ${retries} left reason: ${json.error.message}`);
        callAPI(endPoint, messageDataArray, retries - 1);
      }

      if (!isEmpty(queue)) {
        callAPI(endPoint, queue);
      }

      return json;
    });
};

const callAsyncMessagesAPI = (ms, messageDataArray) => new Promise(resolve => setTimeout(() => {
  callAPI('messages', messageDataArray);
  resolve();
}, ms));

const callMessagesAPI = messageDataArray => callAPI('messages', messageDataArray);

const callThreadAPI = messageDataArray => callAPI('thread_settings', messageDataArray);

const callMessngerProfileAPI = messageDataArray => callAPI('messenger_profile', messageDataArray);

const callPsidAPI = (psid) => {
  const qs = `access_token=${encodeURIComponent(PAGE_ACCESS_TOKEN)}`;
  return fetch(`https://graph.facebook.com/v2.6/${psid}?${qs}`, {
    method: 'GET',
  })
    .then(rsp => rsp.json())
    .then((json) => {
      if (json && json.error && json.error.message) {
        throw new Error(json.error.message);
      }
      return json;
    });
};

export default {
  callAsyncMessagesAPI,
  callMessagesAPI,
  callThreadAPI,
  callMessngerProfileAPI,
  callPsidAPI,
};
