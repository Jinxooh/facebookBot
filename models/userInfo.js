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
  }
}

export default UserInfo;