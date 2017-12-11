import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Review = new Schema({
  psid: String,
  first_name: String,
  last_name: String,
  profile_pic: String,

  reviews: { type: Array, default: [] }
});

Review.statics.create = function(psid, first_name, last_name, profile_pic) {
  const user = new this({
    psid, first_name, last_name, profile_pic
  })
  // return the Promise
  const save = user.save()
  return save;
}

Review.static.saveReview = function(psid, review) {
  this.update(
    { psid },
    { $set: {reviews: this.reviews.push(review)}},
    (err) => {
      if(err) console.log('err occurs')
      console.log('review updated!');
    }
  );
}
