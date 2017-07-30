const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const signInInfoSchema = new Schema({
    signInUserId:{type: String, default: ''},
    activityThemeId:{type: String, default: ''},
    kidName:{type: String, default: ''},
    kidGender:{type: String, default: ''},
    kidBirthday:{type: String, default: ''},
    kidSchool:{type: String, default: ''},
    kidClass:{type: String, default: ''},
    kidTeacherName:[String],
    kidHobby:[String],
});

module.export = mongoose.module('signInInfo', signInInfoSchema);
