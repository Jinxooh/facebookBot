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

export const GET_STARTED = 'GET_STARTED'
export const USER_STATE_TAROT = 'USER_STATE_TAROT'
export const USER_STATE_PSY = 'USER_STATE_PSY'
export const USER_STATUS_INIT = 'USER_STATUS_INIT'
export const USER_STATUS_START = 'USER_STATUS_START'
export const USER_STATUS_ANSWERING = 'USER_STATUS_ANSWERING'
export const USER_STATUS_PROCESS = 'USER_STATUS_PROCESS'
export const USER_STATUS_DONE = 'USER_STATUS_DONE'

const dataHelper = (() => {
  let tarotData= null;

  const getQuestion = (psyTestId) => {
    const id = psyTestId === null ? "1": psyTestId
    const [psyTest] = psyTestStore.getByPsyTestId(id);
    
    const question = psyTest.questionList;

    return { psyTest, question };
  }

  return {
    setData: (json) => {
      const { psyTest, tarotName, tarotDescription } = json;
      
      psyTest.map((item) => {
        const question = new QuestionStore();
        const questionStore = question.createStore(item.questionList);

        psyTestStore.insert(new PsyTest(item.id, item.title, item.description, questionStore));
      });
      
      tarotData = {
        tarotName,
        tarotDescription
      }
    },

    getTarotData: (tarotNumber) => {
      const tarotName = tarotData.tarotName[tarotNumber];
      const tarotDescription = tarotData.tarotDescription[tarotNumber];
      return { tarotName, tarotDescription }
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
        if(review) {
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

    setPsyTest: (user, initialize) => {
      // 심리테스트를 호출할때 마다 변경위해서 
      if(initialize || !user.psyTestId){
        const psyTestId = String(Math.floor(Math.random() * psyTestStore.getLength() + 1));
        const current = '1'; // start id
        user.setValue({psyTestId, current, state: {stateName: USER_STATE_PSY, status: USER_STATUS_START}});
      }
    },
    
    // tarot 선택 알고리즘
    selectTarot: (text) => {
      let result = reduce(
        text
      , (sum, n) => { return parseInt(sum) + parseInt(n) });
      
      if(result < 23) {
        if(result === 22) result = 0;
      } else {
        result = parseInt(result / 10) + (result % 10);
      }
      console.log('selectTarot result, ', result);
      return result;
    },

    sayYesOrNo: (user, yesOrNo) => {
      const { question } = getQuestion(user.psyTestId);
      
      // test
      let current = user.current === null ? "1" : user.current;

      user.setValue({next: question.getYesOrNoNext(current, yesOrNo)});
      if(user.next) {
        current = user.next
        user.setValue({current});
        return true;
      } else {
        return false
      }
    },

    checkLast: (user) => {
      if(/^\d+$/.test(user.current)) return false; // 숫자면 false
      return true;
    },
    
    getDescription: (user) => {
      const { psyTest, question } = getQuestion(user.psyTestId);
      return { 
        psyTestDescription: psyTest.description, 
        questionDescription: question.getDescription(user.current)
      };
    },
  }
})();

export default dataHelper;