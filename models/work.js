/**
 * Created by ycong on 2017/8/2.
 */

/*
  work  model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const workSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  activityId: {type: Schema.Types.ObjectId, required: true, ref: 'activity'},
  segmentId: {type: Schema.Types.ObjectId, required: true, ref: 'activityUploading'},
  title: {type: String, required: true},
  workType: [{type: String, required: true}],
  performer: {type: String, required: true},
  performerGender: {type: String, required: true},
  performerAge: {type: String, required: true},
  province: {type: String, required: true},
  city: {type: String, required: true},
  description: {type: String, default: ''},
  images: [String],
  audio: {type: String, default: ''},
  video: {type: String, default: ''},
  commentNum: {type: Number, default: 0},
  likeNum: {type: Number, default: 0},
  collectionNum: {type: Number, default: 0},
  createTime: {type: Date, default: Date.now},
});

module.exports = mongoose.model('work', workSchema);
