const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
    userMsg model
 */

const userMsgSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  unreadLikeMsgNum: {Type: Number, default: 0},
  unreadFollowMsgNum: {Type: Number, default: 0},
  unreadLeaveMsgNum: {Type: Number, default: 0},
  unreadNoticeMsgNum: {Type: Number, default: 0},
  chatMsg: [{
    chatUserId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
    chatContent: {type: String, default: ''},
    chatCreateTime: {type: Date, default: Date.now()}
  }]
});

module.exports = mongoose.model('userMsg', userMsgSchema);
