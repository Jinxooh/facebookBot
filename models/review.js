import mongoose from 'mongoose';

const Schema = mongoose.Schema; // eslint-disable-line prefer-destructuring

const Review = new Schema({
  psid: String,
  first_name: String,
  last_name: String,
  profile_pic: String,

  reviews: { type: Array, default: [] },
});

Review.statics.findOneByPsid = function (psid) { // eslint-disable-line func-names
  console.log('findOneByPsid, ', psid);
  return this.findOne({
    psid,
  }).exec();
};

Review.statics.create = function (psid, first_name, last_name, profile_pic) { // eslint-disable-line func-names
  const review = new this({
    psid, first_name, last_name, profile_pic,
  });
  // return the Promise
  const save = review.save();
  return save;
};

Review.methods.saveReview = function (review) { // eslint-disable-line func-names
  this.reviews.push(review);
  return this.save();
};

export default mongoose.model('Review', Review);
