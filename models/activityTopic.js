const moogoose = require('mongoose');

const Schema = mongoose.Schema;

const activityTopicSchema = new Schema({
    createrId:{type: String, default: ''},
    activityId:{type: String, default: ''},
    title:{type: String, default: ''},
    description:{type: String, default: ''},
    images:[String],
    audio:{type: String, default: ''},
    thumbnail:{type: String, default: ''},
    video:{type: String, default: ''},
    createTime: {type: Date, default: Date.now},
});

module.export = mongoose.module('activityTopic', activityTopicSchema);
