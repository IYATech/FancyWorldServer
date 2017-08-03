const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
  enrollInfo model
 */

const enrollInfoSchema = new Schema({
  enrollUserId: {type: String, default: ''},
  activityId: {type: String, default: ''},
  kidName: {type: String, default: ''},
  kidGender: {type: String, default: ''},
  kidBirthday: {type: String, default: ''},
  kidSchool: {type: String, default: ''},
  kidClass: {type: String, default: ''},
  kidTeacher: [String],
  kidHobby: [String],
  createTime: {type: Date, default: Date.now},
});

module.exports = mongoose.model('enrollInfo', enrollInfoSchema);
