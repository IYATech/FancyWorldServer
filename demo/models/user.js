const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    phone:String,
    password:String,
    nickname:String,
    realName:String,
    identity:[String],
    company:String,
    job:String,
    avatar:String,
    activevalue:Number,
    fansnum:Number,
    follownum:Number,
    birthday:String,
    gender:String,
    address:String,
    lat:Number,
    lng:Number,
    introduction:String,
    kidid:String,
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