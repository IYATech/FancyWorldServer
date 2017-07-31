const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
  activityTopic model
 */

const activityTopicSchema = new Schema({
  createrId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  activityId: {type: Schema.Types.ObjectId, required: true, ref: 'activity'},
  title: {type: String, required: true},
  description: {type: String, default: ''},
  images: [String],
  audio: {type: String, default: ''},
  thumbnail: {type: String, default: ''},
  video: {type: String, default: ''},
  createTime: {type: Date, default: Date.now},
});

module.exports = mongoose.model('activityTopic', activityTopicSchema);
