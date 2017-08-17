const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
    userMsg model
 */

const userMsgSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  newLikeMsgNum: {type: Number, required: true, default: 0},
  newFollowMsgNum: {type: Number, required: true, default: 0},
  newLeaveMsgNum: {type: Number, required: true, default: 0},
  newNoticeMsgNum: {type: Number, required: true, default: 0},
  chatMsgNum: {type: Number, required: true, default: 0},
  lastTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('userMsg', userMsgSchema);
