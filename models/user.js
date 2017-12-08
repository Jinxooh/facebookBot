import mongoose from 'mongoose';
import {
  USER_STATUS_INIT,
  USER_STATE_INIT,
} from '../messenger-api-helpers/database'
import concat from 'lodash/concat';
import set from 'lodash/set';

const Schema = mongoose.Schema;

const User = new Schema({
  psid: String,
  first_name: String,
  last_name: String,
  profile_pic: String,

  current: { type: String, default: null },
  next: { type: String, default: null },
  psyTestId: { type: String, default: null },

  userState: {
    status: { type: String, default: USER_STATUS_INIT },
    stateName: { type: String, default: USER_STATE_INIT },
    retries: { type: Number, default: 0 }
  },

  userQueue: { type: Array, default: [] }
});

User.statics.create = function(psid, first_name, last_name, profile_pic) {
  const user = new this({
    psid, first_name, last_name, profile_pic
  })
  // return the Promise
  const save = user.save()
  return save;
}

User.statics.findOneByUsername = function(psid) {
  return this.findOne({
    psid
  }).exec()
}

User.statics.updateUser = async function(psid, {first_name, last_name, profile_pic, current, next, psyTestId, userState, userQueue}) {
  return await this.findOne({
    psid
  }, (err, user) => {
    if(first_name) user.first_name = first_name;
    if(last_name) user.last_name = last_name;
    if(profile_pic) user.profile_pic = profile_pic;

    if(current) user.current = current;
    if(next) user.next = next;

    if(psyTestId) user.psyTestId = psyTestId;

    if(userState) {
      const { stateName, status, retries } = userState;
      if(stateName) user.userState.stateName = stateName;
      if(status) user.userState.status = status;
      if(retries) user.userState.retries = retries;
    }
    if(userQueue) user.userQueue = userQueue;

    return user.save((err) => {
      if(err) console.error('failed to update');
      // if(userState || userQueue)
        // console.log('user state updated ,', userState);
      // else 
        // console.log('user info updated');
    });
  })
}

User.statics.updateAllUser = function({userQueue, userState }) {
  this.find({}, (err, allUser) => {
    allUser.forEach(user => {
      user.userState = userState;
      user.userQueue = userQueue;

      user.save((err) => {
        if(err) console.error('failed to updateAllUser');
      })
    });
  })
}

User.statics.updateUserQueue = async function(psid, userQueue) {
  let user = await this.findOne({
    psid
  })
  console.log('uuuuserrr,,, ', user);
  await this.update(
    { psid },
    { $set: { userQueue: concat(user.userQueue, userQueue) }}, 
    (err) => {}
  );
  // user = await this.findOne({
  //   psid
  // })
  // console.log('123123123123,,, ', user);
  // this.findOne({
  //   psid
  // }, (err, user) => {
  //   const arr = [];
  //   arr.push(userQueue);
  //   console.log('user.userQueue 1,', user.userQueue);
  //   user.userQueue = arr;
  //   console.log('user.userQueue 2,', user.userQueue);
  //   return user.save((err) => {
  //     if(err) console.error('failed to update');
  //     console.log('success')
  //   });
  // })
  // this.update({
  //   psid
  // }, { $push: { userQueue: [10]}}, (err, user) => {
  //   console.log('hello', user);
  // });
  
  // (err, user) => {
  //   // console.log('save!!');
  //   // console.log('updateUserQueue user,' , user);
  //   // console.log('updateUserQueue userQueue,' , userQueue);
  //   // console.log('err' , err);
  //   if(!user || !userQueue) return;
  //   if(userQueue) {
  //     set(user, 'userQueue', concat(user.userQueue, userQueue))
  //   }
  //   console.log('user.userQueue, ', user.userQueue);
  //   user.save((err) => {
  //     if(err) console.error('failed to update');
  //     console.log('userQueue updated');
  //   }).then(
  //     this.findOne({
  //       psid
  //     }, (err, user1) => {
  //       console.log('user.userQueue?!?!?, ', user1.userQueue);
  //     })
  //   )
  // })
}

export default mongoose.model('User', User)