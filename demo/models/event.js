const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const eventSchema = new Schema({
    activityid:String,
    activitytitle:String,
    actor:String,
    audio:String,
    avatar:[String],
    identify:[[String]],
    nickname:[String],
    uid:[String],
    images:[String],
    address:String,
    lat:Number,
    lng:Number,
    postid:String,
    segmentid:String,
    segmenttitle:String,
    segmenttype:String,
    text:String,
    thumbnail:String,
    video:String,
    workid:String,
    worktitle:String,
    date:String,
    eventid:String,
    likenum:Number,
    commentnum:Number,
    type:String,
    thisavatar:String,
    thisidentify:[String],
    thisnickname:String,
    thisuid:String,
});

// Export Mongoose model
module.exports =  mongoose.model('event', eventSchema);

/*
const events=[{
    activityid:'2',
    activitytitle:'学堂故事',
    actor:'胖胖',
    audio:'www.baidu.com',
    avatar:['http://aya.augth.com/attached/image/20170328/20170328095253_669.jpg','http://aya.augth.com/attached/image/20161206/20161206060900_402.jpg'],
    identify:[['专家','老师','家长'],['专家','老师']],
    nickname:['何子然','赵永斌'],
    uid:['101','102'],
    images:['http://aya.augth.com/attached/image/20170509/20170509105237_269.jpeg ', 'http://aya.augth.com//attached/file/20170514/20170514183236_45_f.jpg'],
    address:'北京市顺义区',
    lat:39.9,
    lng:116.3,
    postid:'666',
    segmentid:'105',
    segmenttitle:'签到环节',
    segmenttype:'5',
    text:'这是文本内容',
    thumbnail:'http://aya.augth.com/attached/image/20170509/20170509105237_269.jpeg',
    video:'http://aya.augth.com/attached/media/20170508/20170508154558_281.mp4 ',
    workid:'106',
    worktitle:'作品标题1',
    date:'1501234000',
    eventid:100050,
    likenum:'998',
    type:'create',
    thisavatar:'http://aya.augth.com/attached/image/20161206/20161206060900_402.jpg',
    thisidentify:['专家','老师','家长'],
    thisnickname:'天宇',
    thisuid:'107',
}]

mongoose.connect('mongodb://123.56.182.49:27017/test');

events.map(function (data) {
    var event = new Event(data);
    event.save();
})
*/
