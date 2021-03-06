// lodash
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
// modules
import sendApi from './send';
// stores
import UserStore from '../stores/user-store';
// models
import Review from '../models/review';

export const GET_STARTED = 'GET_STARTED';
export const USER_STATE_TAROT = 'USER_STATE_TAROT';
export const USER_STATE_STAR = 'USER_STATE_STAR';
export const USER_STATE_PSY = 'USER_STATE_PSY';

export const USER_STATUS_PROCESS = 'USER_STATUS_PROCESS'; // 진행중인 상태
export const USER_STATUS_DONE = 'USER_STATUS_DONE'; // 진행이 끝난 상태

export const MESSAGE_PROCESS = 'MESSAGE_PROCESS'; // 진행중인 상태
export const MESSAGE_DONE = 'MESSAGE_DONE'; // 진행중인 상태

export const MODE_NORMAL = 'MODE_NORMAL';
export const MODE_DATE = 'MODE_DATE';
export const MODE_REVIEW = 'MODE_REVIEW';

const dataHelper = (() => {
  let psyData = null;
  let tarotData = null;
  let starTest = null;

  return {
    setData: (json) => {
      const {
        psyTest,
        tarotName,
        tarotDescription,
        starTestResult,
      } = json;

      psyData = psyTest;

      tarotData = {
        tarotName,
        tarotDescription,
      };

      starTest = starTestResult;
    },

    getTarotData: (tarotNumber) => {
      const tarotName = tarotData.tarotName[tarotNumber];
      const tarotDescription = tarotData.tarotDescription[tarotNumber];
      return { tarotName, tarotDescription };
    },

    getStarData: () => {
      return starTest;
    },

    // user initialize
    getUser: async (senderId) => {
      let [user] = UserStore.getUserByPSID(senderId);

      if (isEmpty(user)) {
        const userInfo = await sendApi.sendGetUserProfile(senderId);
        const {
          first_name, last_name, profile_pic,
        } = userInfo;
        [user] = UserStore.createNewUser(senderId, first_name, last_name, profile_pic);
      }
      return user;
    },

    saveReview: (senderId, user, reviewMessage) => {
      const { first_name, last_name, profile_pic } = user;
      const create = (review) => {
        if (review) {
          return review;
        }
        return Review.create(senderId, first_name, last_name, profile_pic);
      };

      const saveReview = (review) => {
        review.saveReview(reviewMessage);
      };

      Review.findOneByPsid(senderId)
        .then(create)
        .then(saveReview);
    },

    firstEntityValue: (entities, entity) => {
      const val = entities && entities[entity] &&
      Array.isArray(entities[entity]) &&
      entities[entity].length > 0 &&
      entities[entity][0].value;
      if (!val) {
        return null;
      }
      return typeof val === 'object' ? val.value : val;
    },

    // tarot 선택 알고리즘
    selectTarot: (text) => {
      let result = reduce(text, (sum, n) => { return parseInt(sum, 10) + parseInt(n, 10); });

      if (result < 23) {
        if (result === 22) result = 0;
      } else {
        result = parseInt(result / 10, 10) + (result % 10);
      }
      return result;
    },

    // 별자리 선택 알고리즘
    selectStarTest: (month, day) => {
      const name = [
        '물병자리', '물고기자리', '양자리', '황소자리',
        '쌍둥이자리', '게자리', '사자자리', '처녀자리',
        '천칭자리', '전갈자리', '사수자리', '염소자리',
      ];
      const starArray = [20, 19, 21, 20, 21, 22, 23, 23, 24, 23, 23, 25];
      const monthCheck = month === 0 ? 11 : month - 1;
      const starNumber = starArray[month] <= day ? month : monthCheck;
      const starName = name[starNumber];
      return { starName, starNumber };
    },

    arrayToJsonArray: (array, username, starName) => {
      const jsonArray = reduce(array, (result, item, index) => {
        const resultArray = result;
        let replacedItem = item;
        if (username) replacedItem = replacedItem.replace('000(이름) ', username);
        if (starName) replacedItem = replacedItem.replace('( 별.자.리.이.름 ) ', starName);
        resultArray[index] = {
          text: replacedItem,
        };
        return resultArray;
      }, []);
      return jsonArray;
    },

    // for PSY TEST
    setPsyTest: (user, initialize) => {
      // 심리테스트를 호출할때 마다 변경위해서
      if (initialize || !user.psyTestId) {
        const psyTestId = String(Math.floor(Math.random() * psyData.length));
        const current = '0'; // start id
        user.setValue({
          psyTestId, current, stateName: USER_STATE_PSY,
          // messageStatus: USER_STATUS_START,
        });
      }
    },

    getQustionData: (user) => {
      const { questionList } = psyData[user.psyTestId];
      const question = questionList[user.current];
      return question;
    },

    getDescription: (user) => {
      const { description, questionList } = psyData[user.psyTestId];
      const question = questionList[user.current];
      return {
        psyTestDescription: description,
        questionDescription: question.description,
      };
    },
  };
})();

export default dataHelper;
