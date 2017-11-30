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
      status: 'init',
      name: 'INIT',
      retries: 0,
    }
  }

  setCurrent(current) {
    this.current = current;
  }

  getCurrent() {
    return this.current;
  }

  getNext(next) {
    return this.next;
  }

  setNext(next) {
    this.next = next;
  }

  setPsyTestId(psyTestId) {
    this.psyTestId = psyTestId;
  }

  getPsyTestId() {
    return this.psyTestId;
  }

  setState(stateName, state) {
    this.state[stateName] = state;
  }

  getState() {
    return this.state;
  }
}

export default UserInfo;