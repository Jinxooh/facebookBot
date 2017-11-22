// ===== STORES ================================================================
import Store from './store';

import { default as QuestionStore } from './question-store';

class UserStore extends Store {

  getByPsyTestId(psyTestId) {
    return [...this.data.values()]
    .filter((psyTest) => psyTest.id === psyTestId);
  }

  insert(psyTest) {
    return this.set(psyTest.id, psyTest);
  }
}

const UserStore = new UserStore();

export default UserStore;