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
    setPsyTest: (user, initialize) => {
      // 심리테스트를 호출할때 마다 변경위해서 
      if(initialize || !user.getPsyTestId()){
        const createPsyTestId = String(Math.floor(Math.random() * psyTestStore.getLength() + 1));
        user.setPsyTestId(createPsyTestId);
        user.setState("stateName", "PSY_TEST");

        const startId = '1';
        user.setCurrent(startId);
      }
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
      console.log('result, ', result);
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