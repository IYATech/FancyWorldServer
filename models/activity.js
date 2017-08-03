const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
  activity model
 */

const activitySchema = new Schema({
  createrId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  title: {type: String, required: true},
  tag: [String],
  status: {type: String, default: ''},
  committee: [{userId: {type: Schema.Types.ObjectId, ref: 'user'}, isAgree: {type: Boolean}}],
  description: {type: String, default: ''},
  images: [String],
  audio: {type: String, default: ''},
  video: {type: String, default: ''},
  sponsor: [String],
  undertaker: [String],
  customEnrollInfo: [String],
  invisibleUserId: [{type: Schema.Types.ObjectId, required: true, ref: 'user'}],
  visibleUserId: [{type: Schema.Types.ObjectId, required: true, ref: 'user'}],
  viewNum: {type: Number, default: 0},
  signUpNum: {type: Number, default: 0},
  collectionNum: {type: Number, default: 0},
  segment: [{
    segmentType: {type: String, default: ''},
    segmentId: {type: Schema.Types.ObjectId, required: true},
  }],
  createTime: {type: Date, default: Date.now},
  endTime: {type: Date},
  postNum: {type: Number, default: 0}
});

module.exports = mongoose.model('activity', activitySchema);