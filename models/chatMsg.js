const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
  chatMsg model
 */

const chatMsgSchema = new Schema({
  sendUserId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  recvUserId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  msgType: {type: String, required: true},
  msgResult: {type: String, default: ''},
  msgContent: {type: String, default: ''},
  msgContentId: {type: String, default: ''},
  msgCreateTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('chatMsg', chatMsgSchema);
