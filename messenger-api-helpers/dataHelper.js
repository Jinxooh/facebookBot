// modules
import sendApi from './send';

// stores
import psyTestStore from '../stores/psyTest-store';
import QuestionStore from '../stores/question-store';
import UserStore from '../stores/user-store';

// models
import PsyTest from '../models/psyTest';
import Review from '../models/review';
// lodash
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';

export const GET_STARTED = 'GET_STARTED';
export const USER_STATE_TAROT = 'USER_STATE_TAROT';
export const USER_STATE_STAR = 'USER_STATE_STAR';
export const USER_STATE_PSY = 'USER_STATE_PSY';
export const USER_STATUS_INIT = 'USER_STATUS_INIT'; // 초기값 
export const USER_STATUS_START = 'USER_STATUS_START'; // 진행 시작
export const USER_STATUS_PROCESS = 'USER_STATUS_PROCESS'; // 진행중인 상태
export const USER_STATUS_ANSWERING = 'USER_STATUS_ANSWERING'; // 사용자 입력을 받는 상태 
export const USER_STATUS_DONE = 'USER_STATUS_DONE'; // 진행이 끝난 상태

const dataHelper = (() => {
  let tarotData= null;
  let starTest = null;

  const getQuestion = (psyTestId) => {
    const id = psyTestId === null ? "1": psyTestId
    const [psyTest] = psyTestStore.getByPsyTestId(id);
    
    const question = psyTest.questionList;

    return { psyTest, question };
  }

  return {
    setData: (json) => {
      const { psyTest, tarotName, tarotDescription, starTestResult } = json;
      
      psyTest.map((item) => {
        const question = new QuestionStore();
        const questionStore = question.createStore(item.questionList);

        psyTestStore.insert(new PsyTest(item.id, item.title, item.description, questionStore));
      });
      
      tarotData = {
        tarotName,
        tarotDescription
      }

      starTest = starTestResult;
    },

    getTarotData: (tarotNumber) => {
      const tarotName = tarotData.tarotName[tarotNumber];
      const tarotDescription = tarotData.tarotDescription[tarotNumber];
      return { tarotName, tarotDescription }
    },

    getStarData: (starNumber) => {
      return starTest[starNumber];
    },

    // user initialize
    getUser: async (senderId) => {
      let [user] = UserStore.getUserByPSID(senderId);
      
      if (isEmpty(user)) {
        const userInfo = await sendApi.sendGetUserProfile(senderId);
        const { first_name, last_name, profile_pic } = userInfo;
        [user] = UserStore.createNewUser(senderId, first_name, last_name, profile_pic);
      }
      return user;
    },

    saveReview: (senderId, user, reviewMessage) => {
      const { first_name, last_name, profile_pic } = user;
      const create = (review) => {
        if (review) {
          return review;
        } else {
          return Review.create(senderId, first_name, last_name, profile_pic);
        }
      }

      const saveReview = (review) => {
        review.saveReview(reviewMessage);
      };

      Review.findOneByPsid(senderId)
      .then(create)
      .then(saveReview);
    },

    setStarTest: (user) => {
        const current = null; // start id
        user.setValue({current});
    },

    setPsyTest: (user, initialize) => {
      // 심리테스트를 호출할때 마다 변경위해서 
      if (initialize || !user.psyTestId){
        const psyTestId = String(Math.floor(Math.random() * psyTestStore.getLength() + 1));
        const current = '1'; // start id
        user.setValue({psyTestId, current, state: {stateName: USER_STATE_PSY, status: USER_STATUS_START}});
        console.log('user123 ', user.current)
      }
    },
    
    // tarot 선택 알고리즘
    selectTarot: (text) => {
      let result = reduce(
        text
      , (sum, n) => { return parseInt(sum) + parseInt(n) });
      
      if (result < 23) {
        if (result === 22) result = 0;
      } else {
        result = parseInt(result / 10) + (result % 10);
      }
      // console.log('selectTarot result, ', result);
      return result;
    },

    // 별자리 선택 알고리즘
    selectStarTest: (month, day) => { 
      const name = ['염소자리', '물병자리', '물고기자리', '양자리', '황소자리', '쌍둥이자리', '게자리', '사자자리', '처녀자리', '천칭자리', '전갈자리', '사수자리'];
      const starArray = [19, 18, 20, 19, 20, 21, 22, 22, 23, 22, 22, 24];
      
      const monthCheck = month === 11 ? 0 : month + 1;
      const starNumber = starArray[month] >= day ? month : monthCheck;
      const starName = name[starNumber];
      // return { starName, starNumber };
      return starNumber;
    },

    sayYesOrNo: (user, yesOrNo) => {
      const { question } = getQuestion(user.psyTestId);
      
      // test
      let current = user.current === null ? "1" : user.current;

      user.setValue({next: question.getYesOrNoNext(current, yesOrNo)});
      if (user.next) {
        current = user.next
        user.setValue({current});
        return true;
      } else {
        return false
      }
    },

    checkLast: (user) => {
      if (/^\d+$/.test(user.current)) return false; // 숫자면 false
      return true;
    },
    
    getDescription: (user) => {
      const { psyTest, question } = getQuestion(user.psyTestId);
      return { 
        psyTestDescription: psyTest.description, 
        questionDescription: question.getDescription(user.current)
      };
    },
    
    arrayToJsonArray: (array) => {
      const jsonArray = reduce(array, (result, item, index) => {
        result[index] = {
          text: item
        };
        return result;
      }, []);

      return jsonArray;
    }
  }
})();

export default dataHelper;