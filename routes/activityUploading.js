/**
 * Created by jialing on 2017/8/1.
 */

const express = require('express');
const router = express.Router();
const ActivityService = require('../service/activity');
const Activity = require('../models/activity');
const ActivityUploading = require('../models/activityUploading');
const Work = require('../models/work');
const EnrollInfo = require('../models/enrollInfo');

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
        let uploading = new ActivityUploading({
          createrId: req.user._id,
          activityId,
          title,
          description: description,
          images,
          audio,
          video
        });
        let segmentId;
        uploading.save()
          .then(p => {
            data.segment.push({
              segmentId: p._id,
              segmentType: 'uploading'
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
    })
});

router.post('/get', function (req, res) {
  const {activityId, segmentId} = req.body;

  if (!activityId || !segmentId) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  ActivityUploading.findOne({_id: segmentId, activityId})
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
        res.json(ErrMsg.NotFound)
      }
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/upload', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {
    activityId, segmentId, title, workType,
    performer, performerGender, performerAge, province, city,
    description, images, audio, video
  } = req.body;

  if (!activityId || !segmentId || !title || !workType || !description ||
    !performer || !performerGender || !performerAge || !province || !city) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  Promise.all([
    ActivityService.isActivityCreater(activityId, req.user._id),
    EnrollInfo.findOne({enrollUserId: req.user._id, activityId: activityId}, '_id').exec()
  ])
    .then(data => {
      if (data[0] || data[1]) {
        let work = new Work({
          userId: req.user._id,
          activityId: activityId,
          segmentId: segmentId,
          title,
          workType,
          performer,
          performerGender,
          performerAge,
          province,
          city,
          description,
          images,
          audio,
          video,
          commentNum: 0,
          likeNum: 0
        });
        work.save()
          .then(data => {
            res.json({
              code: 0,
              message: 'ok',
              result: data._id
            })
          })
          .catch(err => {
            res.json(ErrMsg.DB);
            console.log(err.message);
          })
      }
      else {
        res.json(ErrMsg.Enroll)
      }
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    });
});

router.post('/workList', function (req, res) {
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
  }

  Promise.all([
    Work.find({activityId, segmentId})
      .select('_id userId activityId title workType performer performerGender performerAge province city description images audio video commentNum likeNum createTime')
      .sort({createTime: 'desc'})
      .limit(pageSize)
      .skip(page)
      .populate([
        {path: 'userId', select: '_id nickname avatar identity'},
        {path: 'activityId', select: '_id title'}
      ]),
    Work.count({activityId, segmentId}).exec()
  ])
    .then(data => {
      res.json({
        code: 0,
        message: 'ok',
        result: {
          page,
          pageSize: data[0].length,
          total: data[1],
          data: data[0]
        }
      })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

module.exports = router;