const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
  activity model
 */

const activitySchema = new Schema({
    createrId: {type: String, default: ''},
    title: {type: String, default: ''},
    tag: [String],
    endTime: {type: String, default: ''},
    status: {type: String, default: ''},
    committeeId: [String],
    viewNum: {type: Number, default: 0},
    signUpNum: {type: Number, default: 0},
    collectionNum: {type: Number, default: ''},
    segment: [{
        segmentType: {type: String, default: ''},
        segmentId: {type: String, default: ''}
    }],
    createTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('activity', activitySchema);
