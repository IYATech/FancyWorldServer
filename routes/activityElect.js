/**
 * Created by jialing on 2017/8/1.
 */

const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const ActivityElect = require('../models/activityElect');
const _ = require('lodash');

router.post('/add', function (req, res, next) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {activityId, title, description, images, video, audio, thumbnail} = req.body;

  if (!activityId || !title || !description) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  Activity.findOne({_id: activityId, createrId: req.user._id})
    .then(data => {
      if (!data) {
        res.json({
          code: -1,
          message: '活动不存在'
        });
      }
      else {
        let topic = new ActivityElect({
          createrId: req.user._id,
          activityId,
          title,
          description: description,
          images,
          audio,
          thumbnail,
          video,
          score: []
        });
        let segmentId;
        topic.save()
          .then(p => {
            data.segment.push({
              segmentId: p._id,
              segmentType: 'elect'
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

router.post('/get', function (req, res, next) {
  const {activityId, segmentId} = req.body;

  if (!activityId || !segmentId) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let conditions;
  if (req.user) {
    conditions = {
      _id: activityId,
      segment: {$elemMatch: {segmentId, segmentType: 'elect'}},
      // $or: [{createrId: {$eq: req.user._id}}, {$and:[{visibleUserId:},{visibleUserId: {$elemMatch: {$eq: req.user._id}}}]}, {invisibleUserId: {$not: {$elemMatch: {$eq: req.user._id}}}}]
    }
  } else {
    conditions = {
      _id: activityId,
      segment: {$elemMatch: {segmentId, segmentType: 'elect'}},
      $or: []
    }
  }

  Activity.findOne(conditions, 'createrId').exec()
    .then(data => {
      if (!data) {
        res.json({
          code: -1,
          message: '活动不存在'
        });
        return;
      }

    })
    .catch(err => {
      console.log(err)
    })
});

module.exports = router;