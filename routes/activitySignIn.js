/**
 * Created by jialing on 2017/8/1.
 */

const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const ActivitySignIn = require('../models/activitySignIn');

router.post('/add', function (req, res, next) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {
    activityId, title, description, images, video,
    audio, thumbnail, lat, lng, address
  } = req.body;

  if (!activityId || !title || !description || !address || !lat || !lng) {
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
        let topic = new ActivitySignIn({
          createrId: req.user._id,
          activityId,
          title,
          description,
          images,
          audio,
          thumbnail,
          video,
          address,
          lat,
          lng,
        });
        let segmentId;
        topic.save()
          .then(p => {
            data.segment.push({
              segmentId: p._id,
              segmentType: 'signIn'
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
    })
});

module.exports = router;