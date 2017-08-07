/**
 * Created by ycong on 2017/8/1.
 */

/*
  activityElect model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activityElectSchema = new Schema({
  createrId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  activityId: {type: Schema.Types.ObjectId, required: true, ref: 'activity'},
  title: {type: String, required: true},
  description: {type: String, default: ''},
  images: [String],
  audio: {type: String, default: ''},
  video: {type: String, default: ''},
  score: [{
    workId: {type: String, required: true, ref: 'work'},
    name: {type: String, required: true},
    default: []
  }],
  createTime: {type: Date, default: Date.now},
  postNum: {type: Number, default: 0}
});

module.exports = mongoose.model('activityElect', activityElectSchema);
