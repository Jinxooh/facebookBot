import psyTestStore from '../stores/psyTest-store';
import QuestionStore from '../stores/question-store';
import PsyTest from '../models/psyTest';
import sendApi from './send';

const dataHelper = (() => {
  let psyStore = psyTestStore;
  let questionList = null;

  return {
    setData: (json) => {
      const { psyTest } = json;
      psyTest.map((item) => {
        const question = new QuestionStore();
        const questionList = question.createStore(item.questionList);

        psyTestStore.insert(new PsyTest(item.id, item.title, item.description, questionList));
      });
      psyStore = psyTestStore;
      console.log('set data done');
    },
    initialize: () => {
      [psyStore] = psyTestStore.getByPsyTestId(String(Math.floor(Math.random() * psyTestStore.getLength() + 1)));
      questionList = psyStore.questionList;
      questionList.setCurrent('1');
      questionList.setDescription();

      return { psyStore, questionList }
    },
    sayYes: () => {
      if(questionList.getCurrent() === null) questionList.setCurrent('1');
      questionList.setNext(questionList.selectYes());
      questionList.setDescription();
    },
    sayNo: () => {
      if(questionList.getCurrent() === null) questionList.setCurrent('1');
      questionList.setNext(questionList.selectNo());
      questionList.setDescription();
    },
    checkLast: () => {
      if(/^\d+$/.test(questionList.getCurrent())) return true;
      return false;
    },
    getDescription: () => {
      return questionList.getDescription();
    }
  }
})();

export default dataHelper;