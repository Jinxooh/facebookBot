// ===== STORES ================================================================
import Store from './store';

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

export default PSY_TEST_STORE;