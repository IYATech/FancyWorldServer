/**
 * Created by ycong on 2017/8/2.
 */

/*
  work  model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const workSchema = new Schema({
  createrId: {type: Schema.Types.ObjectId, require: true, ref: 'user'},
  segmentId: {type: Schema.Types.ObjectId, require: true, ref: 'activityUploading'},
  title: {type: String, require: true},
  workType: [{type: String, require: true}],
  performer: {type: String, require: true},
  performerGender: {type: String, require: true},
  performerAge: {type: String, require: true},
  province: {type: String, require: true},
  city: {type: String, require: true},
  description: {type: String, default: ''},
  images: [{type: String, default: ''}],
  audio: {type: String, default: ''},
  thumbnail: {type: String, default: ''},
  video: {type: String, default: ''},
  commentNum: {type: Number, default: ''},
  likeNum: {type: Number, default: ''},
  createTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('work', workSchema);
