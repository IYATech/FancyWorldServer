/**
 * Created by ycong on 2017/8/2.
 */

/*
  work  model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const workSchema = new Schema({
  createrId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  segmentId: {type: Schema.Types.ObjectId, required: true, ref: 'activityUploading'},
  title: {type: String, required: true},
  workType: [{type: String, required: true}],
  performer: {type: String, required: true},
  performerGender: {type: String, required: true},
  performerAge: {type: String, required: true},
  province: {type: String, required: true},
  city: {type: String, required: true},
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
