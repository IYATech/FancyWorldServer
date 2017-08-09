/**
 * Created by ycong on 2017/8/2.
 */

/*
  activityCourse model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activityCourseSchema = new Schema({
  createrId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  activityId: {type: Schema.Types.ObjectId, required: true, ref: 'activity'},
  title: {type: String, require: true},
  description: {type: String, default: ''},
  performer: {type: String, required: true},
  video: {type: String, required: true},
  createTime: {type: Date, default: Date.now},
  postNum: {type: Number, default: 0}
});

module.exports = mongoose.model('activityCourse', activityCourseSchema);