// ===== STORES ================================================================
import Store from './store';

class UserStore extends Store {

  getUserByPSID(userPSID) {
    return [...this.data.values()]
    .filter((user) => user.psid === userPSID);
  }

  insert(user) {
    return this.set(user.psid, user);
  }
}

const USER_STORE = new UserStore();

export default USER_STORE;