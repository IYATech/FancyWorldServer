const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
    createrId:String,
    title:String,
    tag:[String],
    endTime:String,
    status:String,
    committeeId:[String],
    viewNum:Number,
    signUpNum:Number,
    collectionNum:Number,
    createTime: {type: Date, default: Date.now},
});

module.exports =  mongoose.model('activity', activitySchema);

/*
var Activity = mongoose.model('activity', activitySchema);

const activitys=[{
    createrId:'100',
    title:'学堂故事',
    tag:['音乐','体育'],
    endTime:'2017-10-01',
    status:'进行中',

}];

mongoose.connect('mongodb://123.56.182.49:27017/test');

activitys.map(function (data) {
    var activity = new Activity(data);
    activity.save();
});
*/
