/**
 * Created by jialing on 2017/8/3.
 */

const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const ActivityCourse = require('../models/activityCourse');
const Event = require('../models/event');

router.post('/add', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {activityId, title, description, performer, video} = req.body;

  if (!activityId || !title || !description || !performer || !video) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  Activity.findOne({_id: activityId, createrId: req.user._id}).exec()
    .then(data => {
      if (!data) {
        res.json(ErrMsg.NotFound);
      }
      else if (data.status !== ActivityStatus.ongoing) {
        res.json(ErrMsg.NotPublish)
      }
      else {
        let course = new ActivityCourse({
          createrId: req.user._id,
          activityId,
          title,
          description,
          performer,
          video,
        });
        let segmentId;
        course.save()
          .then(p => {
            data.segment.push({
              segmentId: p._id,
              segmentType: 'course'
            });
            segmentId = p._id;
            return data.save();
          })
          .then(() => {
            let event = new Event({
              createrId: req.user.id,
              eventType: global.EventType.NewsCourse,
              activityId: course.activityId,
              segmentId: segmentId,
              segmentTitle: course.title,
              segmentText: course.description,
              video: course.video,
              performer:course.performer
            });
            return event.save();
          })
          .then(() => {
            res.json({
              code: 0,
              message: 'ok',
              result: {
                activityId,
                segmentId
              }
            })
          })
          .catch(err => {
            res.json(ErrMsg.DB);
            console.log(err.message);
          })
      }
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    });
});

router.post('/get', function (req, res) {
  const {activityId, segmentId} = req.body;

  if (!activityId || !segmentId) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  ActivityCourse.findOne({activityId, _id: segmentId})
    .select('_id createrId activityId title description performer video createTime postNum')
    .exec()
    .then(data => {
      if (data) {
        res.json({
          code: 0,
          message: 'ok',
          result: data
        })
      } else {
        res.json(ErrMsg.NotFound)
      }
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

module.exports = router;