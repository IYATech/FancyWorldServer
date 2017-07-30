const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activitySegment = new Schema({
    segmentType:[String],
    segmentId:[String],
});