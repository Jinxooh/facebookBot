import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Review = new Schema({
  psid: String,
  first_name: String,
  last_name: String,
  profile_pic: String,

  reviews: { type: Array, default: [] }
});

Review.statics.findOneByPsid = function(psid) {
  return this.findOne({
    psid
  }).exec()
}

Review.statics.create = function(psid, first_name, last_name, profile_pic) {
  const review = new this({
    psid, first_name, last_name, profile_pic
  })
  // return the Promise
  const save = review.save()
  return save;
}

Review.methods.saveReview = function(review) {
  this.reviews.push(review);
  return this.save();
}

export default mongoose.model('Review', Review)
