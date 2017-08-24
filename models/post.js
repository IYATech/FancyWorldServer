/**
 * Created by ycong on 2017/8/1.
 */

/*
 post model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  createrId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  segmentType: {type: String, default: ''},
  segmentId: {type: String, required: true},
  content: {type: String, required: true},
  images: [String],
  audio: {type: String, default: ''},
  commentNum: {type: Number, default: 0},
  likeNum: {type: Number, default: 0},
  createTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('post', postSchema);
