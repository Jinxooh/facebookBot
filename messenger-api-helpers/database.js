import psyTestStore from '../stores/psyTest-store';
import QuestionStore from '../stores/question-store';
import PsyTest from '../models/psyTest';

const dataHelper = (() => {
  let psyStore = null;
  let questionList = null;

  return {
    setData: (json) => {
      const { psyTest } = json;
      psyTest.map((item) => {
        const question = new QuestionStore();
        const questionStore = question.createStore(item.questionList);

        psyTestStore.insert(new PsyTest(item.id, item.title, item.description, questionStore));
      });
    },
    initialize: () => {
      [psyStore] = psyTestStore.getByPsyTestId(String(Math.floor(Math.random() * psyTestStore.getLength() + 1)));
      questionList = psyStore.questionList;
      questionList.setCurrent('1');
      questionList.setDescription();

      return { psyStore, questionList }
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