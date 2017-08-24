/**
 * Created by ycong on 2017/8/1.
 */

/*
  kid model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const kidSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  kidName: {type: String, required: true},
  kidBirthday: {type: String, required: true},
  kidGender: {type: String, default: ''},
  kidHobby: [String],
  kidSchool: {type: String, default: ''},
  kidClass: {type: String, default: ''},
  kidTeacher: [String],
  kidCounselor: [String],
  introduction: {type: String, default: ''}
});

module.exports = mongoose.model('kid', kidSchema);
