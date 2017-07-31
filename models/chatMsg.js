const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
  chatMsg model
 */

const chatMsgSchema = new Schema({
  sendUserId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  recvUserId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  msgType: {type: String, default: ''},
  msgStatus: {type: String, default: ''},
  msgResult: {type: String, default: ''},
  msgContent: {type: String, default: ''},
  msgCreateTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('chatMsg', chatMsgSchema);
