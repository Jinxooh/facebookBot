import mongoose from 'mongoose';

const Schema = mongoose.Schema; // eslint-disable-line prefer-destructuring

const ShareCount = new Schema({
  psid: String,
  type: String,
});

ShareCount.statics.saveShareCount = function (psid, type) { // eslint-disable-line func-names
  const count = new this({
    psid, type,
  });
  // return the Promise
  const save = count.save();
  return save;
};

export default mongoose.model('ShareCount', ShareCount);
