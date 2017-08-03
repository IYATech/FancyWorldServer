/**
 * Created by jialing on 2017/8/3.
 */

const express = require('express');
const router = express.Router();
const activityService = require('../service/activity');
const Activity = require('../models/activity');
const ActivityLesson = require('../models/activityLesson');

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
        res.json({
          code: -1,
          message: '活动不存在'
        });
      }
      else {
        let lesson = new ActivityLesson({
          createrId: req.user._id,
          activityId,
          title,
          description,
          performer,
          video,
        });
        let segmentId;
        lesson.save()
          .then(p => {
            data.segment.push({
              segmentId: p._id,
              segmentType: 'lesson'
            });
            segmentId = p._id;
            return data.save();
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
            res.json({
              code: ErrMsg.DB.code,
              message: err.message
            })
          })
      }
    })
    .catch(err => {
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      })
    });
});

router.post('/get', function (req, res) {
  const {activityId, segmentId} = req.body;

  if (!activityId || !segmentId) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  activityService.hasPermission(activityId, req.user && req.user._id)
    .then(result => {
      if (!result) {
        res.json({
          code: -1,
          message: '活动不存在或无权查看'
        });
        return;
      }

      ActivityTopic.findById(segmentId)
        .select('_id createrId activityId title description performer video createTime postNum')
        .exec()
        .then(data => {
          res.json({
            code: 0,
            message: 'ok',
            result: data
          });
        })
        .catch(err => {
          res.json({
            code: ErrMsg.DB.code,
            message: err.message
          });
        })
    })
    .catch(err => {
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      });
    })
});

module.exports = router;