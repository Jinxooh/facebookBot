import mongoose from 'mongoose';

const { Schema } = mongoose;

const Review = new Schema({
  psid: String,
  first_name: String,
  last_name: String,
  profile_pic: String,

  reviews: { type: Array, default: [] },
});

Review.statics.findOneByPsid = (psid) => {
  return this.findOne({
    psid,
  }).exec();
};

Review.statics.create = (psid, first_name, last_name, profile_pic) => {
  const review = new this({
    psid, first_name, last_name, profile_pic
  });
  // return the Promise
  const save = review.save();
  return save;
};

Review.methods.saveReview = (review) => {
  this.reviews.push(review);
  return this.save();
};

export default mongoose.model('Review', Review);
