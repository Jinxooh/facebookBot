// modules
import sendApi from './send';

// stores
import psyTestStore from '../stores/psyTest-store';
import QuestionStore from '../stores/question-store';
import UserStore from '../stores/user-store';

// models
import PsyTest from '../models/psyTest';
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import split from 'lodash/split';
import join from 'lodash/join';

const dataHelper = (() => {
  let tarotData= null;

  const initializeUser = async (senderId, initialize) => {
    let [user] = UserStore.getUserByPSID(senderId);

    if (isEmpty(user)) {
      const userInfo = await sendApi.sendGetUserProfile(senderId);
      const { first_name, last_name, profile_pic } = userInfo;
      [user] = UserStore.createNewUser(senderId, first_name, last_name, profile_pic);
    }
    
    // 심리테스트를 호출할때 마다 변경위해서 
    if(initialize || !user.getPsyTestId()){
      const createPsyTestId = String(Math.floor(Math.random() * psyTestStore.getLength() + 1));
      user.setPsyTestId(createPsyTestId);
      user.setState("TESTING");
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
      const { psyTest, tarotName, tarotDescription } = json;
      
      psyTest.map((item) => {
        const question = new QuestionStore();
        const questionStore = question.createStore(item.questionList);

        psyTestStore.insert(new PsyTest(item.id, item.title, item.description, questionStore));
      });
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
    setPsyTest: (user, initialize) => {
      // 심리테스트를 호출할때 마다 변경위해서 
      if(initialize || !user.getPsyTestId()){
        const createPsyTestId = String(Math.floor(Math.random() * psyTestStore.getLength() + 1));
        user.setPsyTestId(createPsyTestId);
        user.setState("PsyTest");

        const startId = '1';
        user.setCurrent(startId);
      }
    },

    setTarotTest: (user) => {
      user.setState("TarotTest");
    },
    
    // tarot 선택 알고리즘
    selectTarot: (text) => {
      let result = reduce(
        // _.join(
        //   // _.split("1999.02.12",".")
        //   _.split(text, ".")
        // , "")
        text
      , (sum, n) => { return parseInt(sum) + parseInt(n) });
      
      if(result < 23) {
        if(result === 22) result = 0;
      } else {
        result = parseInt(result / 10) + (result % 10);
      }
      return result - 1;
    },

    sayYesOrNo: (user, yesOrNo) => {
      const { question } = getQuestion(user.getPsyTestId());

      const current = user.getCurrent();
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