import {
  GET_STARTED,
  MESSAGE_DONE,
  MODE_NORMAL,
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

    this.retries = 0;
    this.stateName = GET_STARTED;
    this.modes = MODE_NORMAL;
    this.messageStatus = MESSAGE_DONE;

    // this.userQueue = [];
  }

  pushUserQueue(queue) {
    this.userQueue.push(queue);
  }

  setValue({
    current, next, psyTestId, userQueue, retries, stateName, modes, messageStatus,
  }) {
    console.log('====================');

    if (stateName) console.log('stateName', stateName);
    if (modes) console.log('modes', modes);
    if (messageStatus) console.log('messageStatus', messageStatus);

    if (current) this.current = current;
    if (next) this.next = next;
    if (psyTestId) this.psyTestId = psyTestId;

    if (userQueue) this.userQueue = userQueue;

    if (retries) this.retries = retries;
    if (stateName) this.stateName = stateName;
    if (modes) this.modes = modes;
    if (messageStatus) this.messageStatus = messageStatus;
  }
}

export default UserInfo;
