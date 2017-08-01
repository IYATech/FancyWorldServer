/**
 * Created by ycong on 2017/8/1.
 */

/*
 post model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  createrId: {types: Schema.ObjectId, require: true, ref: 'user'},
  postType: {type: String, default: ''},
  sourceId: {type: String, require: true},
  content: {type: String, require: true},
  images: [String],
  audio: {type: String, default: ''},
  postNum: {type: Number, default: 0},
  likeNum: {type: Number, default: 0},
  createTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('post', postSchema);
