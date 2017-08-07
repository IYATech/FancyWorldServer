/**
 * Created by jialing on 2017/8/1.
 */

const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const ActivityNotice = require('../models/activityNotice');

router.post('/add', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {activityId, title, description, images, video, audio} = req.body;

  if (!activityId || !title || !description) {
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
        let notice = new ActivityNotice({
          createrId: req.user._id,
          activityId,
          title,
          description: description,
          images,
          audio,
          video
        });
        let segmentId;
        notice.save()
          .then(p => {
            data.segment.push({
              segmentId: p._id,
              segmentType: 'notice'
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

  ActivityNotice.findOne({activityId, _id: segmentId})
    .select('_id createrId activityId title description images audio video createTime postNum')
    .exec()
    .then(data => {
      if (data) {
        res.json({
          code: 0,
          message: 'ok',
          result: data
        })
      } else {
        res.json({
          code: -1,
          message: '未找到活动'
        })
      }
    })
    .catch(err => {
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      });
    })
});

module.exports = router;