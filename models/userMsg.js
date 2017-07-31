const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
    userMsgSchema
 */

const userMsgSchema = new Schema({
    userId: {type: String, default: ''},
    likeMsgId: [String],
    followMsgId: [String],
    leaveMsgId: [String],
    noticeMsgId: [String],
    chatMsg: [{
        chatUserId: {type: String, default: ''},
        chatContent: {type: String, default: ''},
        chatCreateTime: {type: String, default: ''}
    }]
});

module.export = mongoose.module('userMsg', userMsgSchema);
