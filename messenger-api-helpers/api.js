// lodash
import castArray from 'lodash/castArray';
import isEmpty from 'lodash/isEmpty';

// ===== MODULES ===============================================================
import request from 'request';

import UserInfo from '../models/userInfo';

const SERVER_URL = process.env.BOT_DEV_ENV == 'dev' ? process.env.TEST_SERVER_URL : process.env.SERVER_URL;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const RETRIES = 0;

const callAPI = (endPoint, messageDataArray, queryParams = {}, retries = RETRIES) => {
  // Error if developer forgot to specify an endpoint to send our request to
  if (!endPoint) {
    console.error('callAPI requires you specify an endpoint.');
    return;
  }

  // Error if we've run out of retries.
  if (retries < 0) {
    console.error(
      'No more retries left.',
      {endPoint, messageDataArray, queryParams}
    );

    return;
  }

  const query = Object.assign({access_token: PAGE_ACCESS_TOKEN}, queryParams);

  const [messageToSend, ...queue] = castArray(messageDataArray);
  request({
    uri: `https://graph.facebook.com/v2.6/me/${endPoint}`,
    qs: query,
    method: 'POST',
    json: messageToSend,

  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      // Message has been successfully received by Facebook.
      console.log(
        `Successfully sent message to ${endPoint} endpoint: `,
        JSON.stringify(body)
      );

      // Continue sending payloads until queue empty.
      if (!isEmpty(queue)) {
        callAPI(endPoint, queue, queryParams);
      }
    } else {
      // Message has not been successfully received by Facebook.
      console.error(
        `Failed calling Messenger API endpoint: '${endPoint}'`,
        response.statusCode,
        response.statusMessage,
        body.error,
        queryParams
      );

      // Retry the request
      console.error(`Retrying Request: ${retries} left`);
      callAPI(endPoint, messageDataArray, queryParams, retries - 1);
    }
  });
}

const callMessagesAPI = (messageDataArray, queryParams = {}) => {
  return callAPI('messages', messageDataArray, queryParams);
};

const callThreadAPI = (messageDataArray, queryParams = {}) => {
  return callAPI('thread_settings', messageDataArray, queryParams);
};

const callPSIDAsyncAPI = (psid, method = 'GET', retries = RETRIES) => {
  return new Promise((resolve, reject) => {
    if (!psid) {
      console.error('callPSIDAPI requires you specify an psid.');
      return;
    }
  
    // Error if we've run out of retries.
    if (retries < 0) {
      console.error(
        'No more retries left.',
        {psid}
      );
      return;
    }
  
    const query = Object.assign({access_token: PAGE_ACCESS_TOKEN});
    
    request({
      uri: `https://graph.facebook.com/v2.6/${psid}`,
      qs: query,
      method: method,
    }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        // Message has been successfully received by Facebook.
        console.log(
          `Successfully sent message to ${psid} endpoint: `,
          JSON.stringify(body)
        );
  
        if(method === 'GET' && body) {
          const { first_name, last_name, profile_pic } = JSON.parse(body);
          const user = new UserInfo(first_name, last_name, profile_pic);
          resolve(user);
        }
      } else {
        // Message has not been successfully received by Facebook.
        console.error(
          `Failed calling Messenger API endpoint: '${psid}'`,
          response.statusCode,
          response.statusMessage,
          body.error,
        );
  
        // Retry the request
        console.error(`Retrying Request: ${retries} left`);
        callPSIDAPI(psid, method, retries - 1);
      }
    });
  }) 
};

const callServer = (url, method = 'POST', retries = RETRIES) => {
  if (!url) {
    console.error('callServer requires you specify an url.');
    return;
  }

  // Error if we've run out of retries.
  if (retries < 0) {
    console.error(
      'No more retries left.',
      {url}
    );
    return;
  }

  request({
    uri: `${SERVER_URL}/${url}`,
    method: method,
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      // Message has been successfully received by Facebook.
      console.log(
        `Successfully sent to ${url} url: `,
        JSON.stringify(body)
      );
    } else {
      // Message has not been successfully received by Facebook.
      console.error(
        `Failed calling server url: '${url}'`,
        response.statusCode,
        response.statusMessage,
        body.error,
      );

      // Retry the request
      console.error(`Retrying Request: ${retries} left`);
      callServer(url, method, retries - 1);
    }
  });
}

export default {
  callMessagesAPI,
  callThreadAPI,
  callPSIDAsyncAPI,
  callServer,
};