/**
 * Created by ycong on 2017/9/4.
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const verifyCodeSchema = new Schema({
  phone: {type: String, require: true},
  code: {type: String, require: true},
  createTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('verifyCode', verifyCodeSchema);


