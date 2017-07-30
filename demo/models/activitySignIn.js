const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activitySignInSchema = new Schema({
    createrId:{type: String, default: ''},
    activityId:{type: String, default: ''},
    title:{type: String, default: ''},
    description:{type: String, default: ''},
    images:[String],
    audio:{type: String, default: ''},
    thumbnail:{type: String, default: ''},
    video:{type: String, default: ''},
    address:{type: String, default: ''},
    lat: {type: Number, default: 0},
    lng: {type: String, default: 0},
    createTime: {type: Date, default: Date.now},
});

module.export = mongoose.module('activitySingIn', activitySignInSchema);