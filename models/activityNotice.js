const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
  activityNotice model
 */

const activityNoticeSchema = new Schema({
  createrId: {type: String, default: ''},
  activityId: {type: String, default: ''},
  title: {type: String, default: ''},
  description: {type: String, default: ''},
  images: [String],
  audio: {type: String, default: ''},
  thumbnail: {type: String, default: ''},
  video: {type: String, default: ''},
  createTime: {type: Date, default: Date.now},
  postNum: {type: Number, default: 0}
});

module.exports = mongoose.model('activityNotice', activityNoticeSchema);
