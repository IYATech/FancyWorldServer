/**
 * Created by ycong on 2017/8/31.
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const workCommentSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, require: true, ref: 'user'},
  workId: {type: Schema.Types.ObjectId, require: true, ref: 'work'},
  createTime: {type: Date, default: Date.now},
  content: {type: String, default: ''},
  audio: {type: String, default: ''}
});

module.exports = mongoose.model('workComment', workCommentSchema);
