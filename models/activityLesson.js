/**
 * Created by ycong on 2017/8/2.
 */

/*
  activityLesson model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activityLessonSchema = new Schema({
  createrId: {type: Schema.Types.ObjectId, require: true, ref: 'user'},
  activityId: {type: Schema.Types.ObjectId, require: true, ref: 'activity'},
  title: {type: String, require: true},
  description: {type: String, default: ''},
  performer: {type: String, require: true},
  video: {type: String, require: true},
  createTime: {type: Date, default: Date.now},
  postNum: {type: Number, default: 0}
});

module.exports = mongoose.model('activityLesson', activityLessonSchema);