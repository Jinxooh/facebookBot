// ===== STORES ================================================================
import Store from './store';

import UserInfo from '../models/userInfo';

class UserStore extends Store {

  getUserByPSID(userPSID) {
    return [...this.data.values()]
    .filter((user) => user.psid === userPSID);
  }

  insert(user) {
    return this.set(user.psid, user);
  }

  createNewUser(psid, first_name, last_name, profile_pic) {
    this.insert(new UserInfo(psid, first_name, last_name, profile_pic));
    return this.getUserByPSID(psid);
  }
}

const USER_STORE = new UserStore();

export default USER_STORE;