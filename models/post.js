/**
 * Created by ycong on 2017/8/1.
 */

/*
 post model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  createrId: {types: Schema.ObjectId, required: true, ref: 'user'},
  sourceType: {type: String, default: ''},
  sourceId: {type: String, required: true},
  content: {type: String, required: true},
  images: [String],
  audio: {type: String, default: ''},
  commentNum: {type: Number, default: 0},
  likeNum: {type: Number, default: 0},
  createTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('post', postSchema);
