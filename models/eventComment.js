/**
 * Created by ycong on 2017/8/4.
 */

/*
  eventComment model
 */

const mongoose = require('mongoose');

const eventCommentSchema = new Schema({
  createrId: {type: Schema.Types.ObjectId, require: true, ref: 'user'},
  eventId: {type: Schema.Types.ObjectId, require: true, ref: 'event'},
  content: {type: String, default: ''},
  createTime: {type: Date, default: Date.now},
});

module.exports = mongoose.model('eventComment', eventCommentSchema);
