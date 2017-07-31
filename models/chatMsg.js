const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
    chatMsgSchema
 */

const chatMsgSchema = new Schema({
    sendUserId: {type: String, default: ''},
    recvUserId: {type: String, default: ''},
    msgType: {type: String, default: ''},
    msgStatus: {type: String, default: ''},
    msgResult: {type: String, default: ''},
    msgContent: {type: String, default: ''},
    msgCreateTime: {type: Date, default: Date.now}
});

module.export = mongoose.moudel('chatMsg', chatMsgSchema);
