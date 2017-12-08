// modules
import sendApi from './send';

// stores
import psyTestStore from '../stores/psyTest-store';
import QuestionStore from '../stores/question-store';
import UserStore from '../stores/user-store';

// models
import PsyTest from '../models/psyTest';

import User from '../models/user';

import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import split from 'lodash/split';
import join from 'lodash/join';

export const USER_STATE_INIT = 'USER_STATE_INIT'
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

       // user State init
      const updateData = { userQueue: [], userState: {status: USER_STATUS_INIT, stateName: USER_STATE_INIT, retries: 0,}}
      User.updateAllUser(updateData);
    },

    getTarotData: (tarotNumber) => {
      const tarotName = tarotData.tarotName[tarotNumber];
      const tarotDescription = tarotData.tarotDescription[tarotNumber];
      return { tarotName, tarotDescription }
    },

    getUser: async (senderId) => {
      let user = await User.findOneByUsername(senderId);
      if(!user) {
        const userInfo = await sendApi.sendGetUserProfile(senderId);
        const { first_name, last_name, profile_pic } = userInfo;
        user = await User.create(senderId, first_name, last_name, profile_pic);
      }
      return user;
    },

    setUser: async (senderId, updateData) => {
      return await User.updateUser(senderId, updateData)
    },

    updateUserQueue: async (senderId, userQueue) => {
      return await User.updateUserQueue(senderId, userQueue)
    },

    updateAllUserStateInitialize: () => {
      const updateData = { userQueue: [], userState: {status: USER_STATUS_INIT, stateName: USER_STATE_INIT, retries: 0,}}
      User.updateAllUser(updateData);
    },
  
    setPsyTest: async (senderId, initialize) => {
      // 심리테스트를 호출할때 마다 변경위해서 
      const user = await dataHelper.getUser(senderId);
      if(initialize || !user.psyTestId){
        const psyTestId = String(Math.floor(Math.random() * psyTestStore.getLength() + 1));
        const current = '1';
        await User.updateUser(
          senderId, 
          {
            psyTestId, 
            current, 
            userState: {stateName: USER_STATE_PSY, status: USER_STATUS_START}
          })
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

    sayYesOrNo: async (senderId, yesOrNo) => {
      let user = await dataHelper.getUser(senderId);
      const { question } = getQuestion(user.psyTestId);
      
      // test
      let current = user.current === null ? "1" : user.current;
      const next = question.getYesOrNoNext(current, yesOrNo);
      user = await User.updateUser(senderId, {next})
      if(user.next) {
        current = user.next;
        user.updateUser(senderId, {current});
        return true;
      } else {
        return false
      }
    },

    checkLast: async(senderId) => {
      const user = await dataHelper.getUser(senderId);
      const current = user.current;
      if(/^\d+$/.test(current)) return false; // 숫자면 false
      return true; // 문자면 마지막 테스트
    },
    
    getDescription: async (senderId) => {
      const user = await dataHelper.getUser(senderId);
      const { psyTest, question } = getQuestion(user.psyTestId);
      return { 
        psyTestDescription: psyTest.description, 
        questionDescription: question.getDescription(user.current)
      };
    },
  }
})();

export default dataHelper;