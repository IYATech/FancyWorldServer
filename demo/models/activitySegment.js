const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activitySegmentSchema = new Schema({
    segmentType:[String],
    segmentId:[String],
});

module.exports = mongoose.model('activitySegment', activitySegmentSchema);