const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
  activityTheme model
 */

const activityThemeSchema = new Schema({
  createrId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  activityId: {type: String, required: true, ref: 'activity'},
  title: {type: String, required: true},
  description: {type: String, default: ''},
  images: [String],
  audio: {type: String, default: ''},
  thumbnail: {type: String, default: ''},
  video: {type: String, default: ''},
  sponsor: [String],
  undertaker: [String],
  customEnrollInfo: [String],
  invisibleUserId: [{type: Schema.Types.ObjectId, required: true, ref: 'user'}],
  visibleUserId: [{type: Schema.Types.ObjectId, required: true, ref: 'user'}],
  enrollInfoId: [{type: Schema.Types.ObjectId, required: true, ref: 'enrollInfo'}],
  createTime: {type: Date, default: Date.now},
});

module.exports = mongoose.model('activityTheme', activityThemeSchema);