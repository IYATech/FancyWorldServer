const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
  enrollInfo model
 */

const enrollInfoSchema = new Schema({
  enrollUserId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  activityId: {type: Schema.Types.ObjectId, required: true, ref: 'activity'},
  kidName: {type: String, default: ''},
  kidGender: {type: String, default: ''},
  kidBirthday: {type: String, default: ''},
  kidSchool: {type: String, default: ''},
  kidClass: {type: String, default: ''},
  kidTeacher: [String],
  kidHobby: [String],
  customEnrollInfo: [{
    name: {type: String, required: true},
    value: {type: String, required: true}
  }],
  createTime: {type: Date, default: Date.now},
});

module.exports = mongoose.model('enrollInfo', enrollInfoSchema);
