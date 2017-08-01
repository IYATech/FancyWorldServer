const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
  user model
 */

const userSchema = new Schema({
  phone: {
    type: String,
    index: true,
    unique: true,
    required: true,
  },
  password: {type: String, required: true},
  nickname: {type: String, required: true},
  realName: {type: String, default: ''},
  identity: [String],
  company: {type: String, default: ''},
  job: {type: String, default: ''},
  avatar: {type: String, default: ''},
  activeValue: {type: Number, default: 0},
  fansNum: {type: Number, default: 0},
  followNum: {type: Number, default: 0},
  birthday: {type: Date},
  gender: {type: String, default: ''},
  address: {type: String, default: ''},
  lat: {type: Number, default: 0},
  lng: {type: Number, default: 0},
  introduction: {type: String, default: ''},
  kidId: [{type: Schema.Types.ObjectId}],
  createTime: {type: Date, default: Date.now},
  accessToken: String
});

module.exports = mongoose.model('user', userSchema);