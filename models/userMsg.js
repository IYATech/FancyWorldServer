const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
    userMsg model
 */

const userMsgSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  newLikeMsgNum: {Type: Number, default: 0},
  newFollowMsgNum: {Type: Number, default: 0},
  newLeaveMsgNum: {Type: Number, default: 0},
  newNoticeMsgNum: {Type: Number, default: 0},
  chatMsgNum: {Type: Number, default: 0}
});

module.exports = mongoose.model('userMsg', userMsgSchema);
