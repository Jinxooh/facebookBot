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

export const USER_STATE = 'stateName'
export const USER_STATUS = 'status'
export const USER_RETRIES = 'retries'
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
      if(initialize || !user.getPsyTestId()){
        const createPsyTestId = String(Math.floor(Math.random() * psyTestStore.getLength() + 1));
        user.setPsyTestId(createPsyTestId);
        user.setState(USER_STATE, USER_STATE_PSY);
        user.setState(USER_STATUS, USER_STATUS_START);
        const startId = '1';
        user.setCurrent(startId);
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
      const { question } = getQuestion(user.getPsyTestId());
      
      // test
      const current = user.getCurrent() === null ? "1" : user.getCurrent();

      user.setNext(question.getYesOrNoNext(current, yesOrNo));
      if(user.getNext()) {
        user.setCurrent(user.getNext());
        return true;
      } else {
        return false
      }
    },

    checkLast: (user) => {
      const current = user.getCurrent();
      if(/^\d+$/.test(current)) return false; // 숫자면 false
      return true;
    },
    
    getDescription: (user) => {
      const { psyTest, question } = getQuestion(user.getPsyTestId());
      return { 
        psyTestDescription: psyTest.description, 
        questionDescription: question.getDescription(user.getCurrent())
      };
    },
  }
})();

export default dataHelper;