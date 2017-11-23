// modules
// import sendApi from './send';

// stores
import psyTestStore from '../stores/psyTest-store';
import QuestionStore from '../stores/question-store';
import UserStore from '../stores/user-store';

// models
import PsyTest from '../models/psyTest';
import _ from 'lodash/core';

const dataHelper = (() => {

  const initializeUser = (senderId, initialize) => {
    let [user] = UserStore.getUserByPSID(senderId);

    if (_.isEmpty(user)) [user] = UserStore.createNewUser(senderId);
    
    if(initialize || !user.getPsyTestId()){
      const createPsyTestId = String(Math.floor(Math.random() * psyTestStore.getLength() + 1));
      user.setPsyTestId(createPsyTestId);
    }

    return user;
  }

  const getQuestion = (psyTestId) => {
    const [psyTest] = psyTestStore.getByPsyTestId(psyTestId);
    const question = psyTest.questionList;

    return { psyTest, question };
  }

  return {
    setData: (json) => {
      const { psyTest } = json;
      psyTest.map((item) => {
        const question = new QuestionStore();
        const questionStore = question.createStore(item.questionList);

        psyTestStore.insert(new PsyTest(item.id, item.title, item.description, questionStore));
      });
    },
    // user initialize
    initialize: (senderId) => {
      const user = initializeUser(senderId, true);
      const { psyTest, question }= getQuestion(user.getPsyTestId());

      const questionId = '1';
      user.setCurrent(questionId);
      
      const psyTestDescription = psyTest.description;
      const questionDescription = question.getDescription(questionId);
      
      return { psyTestDescription, questionDescription }
    },
    sayYes: (senderId) => {
      const user = initializeUser(senderId);
      const { question } = getQuestion(user.getPsyTestId());

      const current = user.getCurrent();
      user.setNext(question.getYesNext(current));
      if(user.getNext()) {
        user.setCurrent(user.getNext());
        return true;
      } else {
        return false
      }
    },
    sayNo: (senderId) => {
      const user = initializeUser(senderId);
      const { question } = getQuestion(user.getPsyTestId());

      const current = user.getCurrent();
      user.setNext(question.getNoNext(current));
      if(user.getNext()) {
        user.setCurrent(user.getNext());
        return true;
      } else {
        return false
      }
    },
    checkLast: (senderId) => {
      const user = initializeUser(senderId);
      const current = user.getCurrent();
      if(/^\d+$/.test(current)) return false; // 숫자면 false
      return true;
    },
    getDescription: (senderId) => {
      const user = initializeUser(senderId);
      const { question } = getQuestion(user.getPsyTestId());
      return question.getDescription(user.getCurrent());
    },
  }
})();

////  타로 개인카드 알고리즘

// const test = (text) => {
//   let result = _.reduce(
//     _.join(
//       _.split("1999.02.12",".")
//       // _.split(text, ".")
//     , "")
//   , (sum, n) => { return parseInt(sum) + parseInt(n) });
  
//   if(result < 23) {
//     if(result === 22) result = 0;
//   } else {
//     result = parseInt(result/10) + (result % 10);
//   }
//   return result;
// }

export default dataHelper;