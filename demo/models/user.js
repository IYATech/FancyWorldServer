const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    phone: {
        type: String,
        index: true,
        unique: true
    },
    password: {type: String, default: ''},
    nickname: {type: String, default: ''},
    realName: {type: String, default: ''},
    identity: [String],
    company: {type: String, default: ''},
    job: {type: String, default: ''},
    avatar: {type: String, default: ''},
    activeValue: {type: Number, default: 0},
    fansNum: {type: Number, default: 0},
    followNum: {type: Number, default: 0},
    birthday: {type: Number, default: 0},
    gender: {type: String, default: ''},
    address: {type: String, default: ''},
    lat: {type: Number, default: 0},
    lng: {type: Number, default: 0},
    introduction: {type: String, default: ''},
    kidid: {type: String, default: ''},
    createtime: {type: Date, default: Date.now},
});

module.exports = mongoose.model('user', userSchema);

/*
var User =  mongoose.model('user', userSchema);

const users=[{
    phone:'13136735550',
    password:'654321',
    nickname:'yikey',
    realname:'郁葱',
    identity:['专家','老师','家长'],
    company:'非凡学习',
    job:'开发',
    avatar:'',
    activevalue:999,
    fansnum:4096,
    follownum:1024,
    birthday:'1989-04-26',
    gender:'男',
    address:'北京市顺义区',
    lat:39.9,
    lng:116.3,
    introduction:'我觉得还可以',
    kidid:'64',
}];

mongoose.connect('mongodb://123.56.182.49:27017/test');

users.map(function (data) {
    var user = new User(data);
    user.save();
});
*/