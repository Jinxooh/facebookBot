// modules
// import sendApi from './send';

// stores
import psyTestStore from '../stores/psyTest-store';
import QuestionStore from '../stores/question-store';
import UserStore from '../stores/user-store';

// models
import UserInfo from '../models/userInfo';
import PsyTest from '../models/psyTest';
import _ from 'lodash/core';

const dataHelper = (() => {
  let psyStore = null;
  let questionList = null;
  let user = null;
  let question = null;

  return {
    setData: (json) => {
      const { psyTest } = json;
      psyTest.map((item) => {
        const question = new QuestionStore();
        const questionStore = question.createStore(item.questionList);

        psyTestStore.insert(new PsyTest(item.id, item.title, item.description, questionStore));
      });
    },
    initialize: (senderId) => {
      [psyStore] = psyTestStore.getByPsyTestId(String(Math.floor(Math.random() * psyTestStore.getLength() + 1)));
      question = psyStore.questionList;
      [user] = UserStore.getUserByPSID(senderId);

      const questionId = '1';
      if (_.isEmpty(user)) {
        // await sendApi.sendGetUserProfile(senderId);
        UserStore.insert(new UserInfo(senderId));
        [user] = UserStore.getUserByPSID(senderId);
      }
      user.setCurrent(questionId);
      
      const psyTestDescription = psyStore.description;
      const questionDescription = question.getDescription(questionId);
      
      return { psyTestDescription, questionDescription }
    },
    sayYes: () => {
      questionList.setNext(questionList.selectYes());
      if(questionList.getNext()) {
        questionList.setCurrent(questionList.getNext());
        questionList.setDescription();
        return true;
      } else {
        return false
      }
    },
    sayNo: () => {
      questionList.setNext(questionList.selectNo());
      if(questionList.getNext()) {
        questionList.setCurrent(questionList.getNext());
        questionList.setDescription();
        return true;
      } else {
        return false
      }
    },
    checkLast: () => {
      const current = questionList.getCurrent();
      if(/^\d+$/.test(current)) return false; // 숫자면 false
      return true;
    },
    getDescription: () => {
      return questionList.getDescription();
    },
    setEnd: () => {
      // this.initialize();
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