// ===== STORES ================================================================
import Store from './store';

import { default as QuestionStore } from './question-store';

class PsyTestStore extends Store {

  getByPsyTestId(psyTestId) {
    return [...this.data.values()]
    .filter((psyTest) => psyTest.id === psyTestId);
  }

  insert(psyTest) {
    return this.set(psyTest.id, psyTest);
  }

  getLength() {
    return [...this.data.values()].length;
  }
}

const PSY_TEST_STORE = new PsyTestStore();
// PSY_TEST_STORE.insert(new PsyTest('1', '허세테스트', '나의 허세지수를 알아보는 심리테스트를 시작 할께요.', QuestionStore.QUESTION_STORE_1));
// PSY_TEST_STORE.insert(new PsyTest('2', '진실테스트', '나의 진실지수를 알아보는 심리테스트를 시작 할께요.', QuestionStore.QUESTION_STORE_2));

export default PSY_TEST_STORE;