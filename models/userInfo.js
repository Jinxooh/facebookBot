import {
  GET_STARTED,
  USER_STATUS_INIT,
} from '../messenger-api-helpers/dataHelper';
/**
 * Question Model
 *
 * @class UserInfo
 */

class UserInfo {
  constructor(psid, first_name, last_name, profile_pic) {
    this.psid = psid;
    this.first_name = first_name;
    this.last_name = last_name;
    this.profile_pic = profile_pic;

    this.current = null;
    this.next = null;
    this.psyTestId = null;

    // status : start, done...
    // stateName : TAROT, PSY_TEST, DONE, INIT...
    this.state = {
      status: USER_STATUS_INIT,
      stateName: GET_STARTED,
      retries: 0,
    }

    this.userQueue = [];
  }

  pushUserQueue(queue) {
    this.userQueue.push(queue);
  }

  setValue({
    current, next, psyTestId, userQueue, state,
  }) {
    if (current) this.current = current;
    if (next) this.next = next;
    if (psyTestId) this.psyTestId = psyTestId;

    if (userQueue) this.userQueue = userQueue;
    if (state) {
      const { status, stateName, retries } = state;
      if (status) this.state.status = status;
      if (stateName) this.state.stateName = stateName;
      if (retries) this.state.retries = retries;
    }
  }
}

export default UserInfo;
