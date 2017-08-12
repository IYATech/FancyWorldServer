/**
 * Created by jialing on 2017/8/1.
 */

const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const ActivityElect = require('../models/activityElect');
const Work = require('../models/work');

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
        res.json(ErrMsg.NotFound);
      }
      else {
        let elect = new ActivityElect({
          createrId: req.user._id,
          activityId,
          title,
          description: description,
          images,
          audio,
          video,
          score: []
        });
        let segmentId;
        elect.save()
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

  ActivityElect.findOne({activityId, _id: segmentId})
    .select('_id createrId activityId title description score images audio video createTime postNum')
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

router.post('/awardList', function (req, res) {
  const {activityId, segmentId} = req.body;

  if (!activityId || !segmentId) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let page, pageSize;
  try {
    page = Number(req.body.page) || 0;
    pageSize = Number(req.body.pageSize) || 10;
  }
  catch (err) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  ActivityElect.findOne({activityId, _id: segmentId}, 'score').exec()
    .then(data => {
      if (data) {
        let startIndex = page * pageSize;
        let arr = data.score.slice(startIndex, startIndex + pageSize);
        let workIds = arr.map(score => {
          return score.workId
        });

        Work.find({_id: {$in: workIds}})
          .select('_id userId title performer description images audio video createTime')
          .populate({path: 'userId', select: '_id nickname avatar identity'})
          .then(result => {
            for (let i = 0, len = result.length; i < len; i++) {
              result[i]._doc.award = arr[i].name;
            }
            res.json({
              code: 0,
              message: 'ok',
              result: {
                page,
                pageSize: result.length,
                total: data.score.length,
                data: result
              }
            })
          })
      }
      else {
        res.json(ErrMsg.NotFound);
      }
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
})

module.exports = router;