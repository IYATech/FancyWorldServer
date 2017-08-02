const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
  activitySingIn model
 */

const activitySignInSchema = new Schema({
  createrId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  activityId: {type: Schema.Types.ObjectId, required: true, ref: 'activity'},
  title: {type: String, required: true},
  description: {type: String, default: ''},
  images: [String],
  audio: {type: String, default: ''},
  thumbnail: {type: String, default: ''},
  video: {type: String, default: ''},
  address: {type: String, default: ''},
  lat: {type: Number, default: 0},
  lng: {type: String, default: 0},
  createTime: {type: Date, default: Date.now},
  postNum: {type: Number, default: 0}
});

module.exports = mongoose.model('activitySingIn', activitySignInSchema);