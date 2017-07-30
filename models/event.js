const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
  event model
 */

const eventSchema = new Schema({
    activityId:{type: String, default: ''},
    activityTitle:{type: String, default: ''},
    actor:{type: String, default: ''},
    audio:{type: String, default: ''},
    avatar:[String],
    identify:[[String]],
    nickname:[String],
    uid:[String],
    images:[String],
    address:{type: String, default: ''},
    lat:{type: Number, default: 0},
    lng:{type: Number, default: 0},
    postId:{type: String, default: ''},
    segmentId:{type: String, default: ''},
    segmentTitle:{type: String, default: ''},
    segmentType:{type: String, default: ''},
    text:{type: String, default: ''},
    thumbnail:{type: String, default: ''},
    video:{type: String, default: ''},
    workId:{type: String, default: ''},
    workTitle:{type: String, default: ''},
    date:{type: String, default: ''},
    likeNum:{type: Number, default: 0},
    commentNum:{type: Number, default: 0},
    type:{type: String, default: ''},
    thisAvatar:{type: String, default: ''},
    thisIdentify:[String],
    thisNickname:{type: String, default: ''},
    thisUid:{type: String, default: ''},
});

// Export Mongoose model
module.exports =  mongoose.model('event', eventSchema);