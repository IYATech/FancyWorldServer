/**
 * Created by ycong on 2017/8/1.
 */

/*
  comment model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  createrId: {type: Schema.types.ObjectId, required: true, ref: 'user'},
  postId: {type: Schema.types.ObjectId, required: true, ref: 'post'},
  content: {type: String, default: ''},
  createTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('comment', commentSchema);
