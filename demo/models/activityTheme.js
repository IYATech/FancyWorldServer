const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activityThemeSchema = new Schema({
    createrId:{type: String, default: ''},
    activityId:{type: String, default: ''},
    title:{type: String, default: ''},
    description:{type: String, default: ''},
    images:[String],
    audio:{type: String, default: ''},
    thumbnail:{type: String, default: ''},
    video:{type: String, default: ''},
    sponsor:[String],
    undertaker:[String],
    customEnrollInfo:[String],
    invisibleUserId:[String],
    visibleUserId:[String],
    enrollInfoId:[String],
    createTime: {type: Date, default: Date.now},
});

module.export = mongoose.module('activityTheme', activityThemeSchema);