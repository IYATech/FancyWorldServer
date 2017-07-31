const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
    userMsg model
 */

const userMsgSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  likeMsgId: [String],
  followMsgId: [String],
  leaveMsgId: [String],
  noticeMsgId: [String],
  chatMsg: [{
    chatUserId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
    chatContent: {type: String, default: ''},
    chatCreateTime: {type: Date, default: Date.now()}
  }]
});

module.exports = mongoose.model('userMsg', userMsgSchema);
