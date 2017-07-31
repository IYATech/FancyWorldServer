const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
  activity model
 */

const activitySchema = new Schema({
  createrId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  title: {type: String, required: true},
  tag: [String],
  endTime: {type: Date},
  status: {type: String, default: ''},
  committeeId: [{type: Schema.Types.ObjectId, ref: 'user'}],
  viewNum: {type: Number, default: 0},
  signUpNum: {type: Number, default: 0},
  collectionNum: {type: Number, default: 0},
  segment: [{
    segmentType: {type: String, default: ''},
    segmentId: {type: Schema.Types.ObjectId, required: true},
  }],
  createTime: {type: Date, default: Date.now},
});

module.exports = mongoose.model('activity', activitySchema);
