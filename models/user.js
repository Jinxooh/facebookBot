import mongoose from 'mongoose';
import {
  USER_STATUS_INIT,
} from '../messenger-api-helpers/database'

const Schema = mongoose.Schema;

const User = new Schema({
  psid: String,
  first_name: String,
  last_name: String,
  profile_pic: String,

  current: { type: String, default: null },
  next: { type: String, default: null },
  psyTestId: { type: String, default: null },

  state: {
    status: { type: String, default: USER_STATUS_INIT },
    stateName: { type: String, default: 'INIT' },
    retries: { type: Number, default: 0 }
  }
});

User.statics.create = function(psid, first_name, last_name, profile_pic) {
  const user = new this({
    psid, first_name, last_name, profile_pic
  })
  // return the Promise
  return user.save()
}

User.statics.findOneByUsername = function(psid) {
  return this.findOne({
    psid
  }).exec()
}

User.methods.getState = function() {
  return this.state;
}

export default mongoose.model('User', User)