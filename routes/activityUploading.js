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
const Event = require('../models/event');
const WorkComment = require('../models/workComment');
const User = require('../models/user');
const mongoose = require('mongoose');

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
      else if (data.status !== ActivityStatus.ongoing) {
        res.json(ErrMsg.NotPublish)
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
            let event = new Event({
              createrId: req.user.id,
              eventType: global.EventType.NewsUpload,
              activityId: uploading.activityId,
              segmentId: segmentId,
              segmentTitle: uploading.title,
              segmentText: uploading.description,
              images: uploading.images,
              audio: uploading.audio,
              video: uploading.video,
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
            });

            let event = new Event({
              createrId: req.user.id,
              eventType: global.EventType.NewsWorks,
              activityId: activityId,
              images: images,
              audio: audio,
              video: video,
              workId: data._id,
            });
            event.save();
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
  if (!activityId) {
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

  let condition;
  if (segmentId) {
    condition = {activityId, segmentId}
  }
  else {
    condition = {activityId}
  }

  Promise.all([
    Work.find(condition)
      .select('_id userId activityId title workType performer performerGender performerAge province city description images audio video commentNum likeNum createTime')
      .sort({createTime: 'desc'})
      .skip(page * pageSize)
      .limit(pageSize)
      .populate([
        {path: 'userId', select: '_id nickname avatar identity'},
        {path: 'activityId', select: '_id title'}
      ]),
    Work.count(condition).exec()
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

router.post('/getWork', function (req, res) {
  const {workId} = req.body;

  Work.aggregate(
    {$match: {_id: mongoose.Types.ObjectId(workId)}},
    {
      $lookup: {
        from: User.collection.collectionName,
        localField: 'userId',
        foreignField: '_id',
        as: 'upUser'
      }
    },
    {
      $unwind: {
        path: '$upUser',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        upUser: {
          userId: '$upUser._id',
          nickname: '$upUser.nickname',
          avatar: '$upUser.avatar',
          identity: '$upUser.identity',
        },
        title: 1,
        type: 1,
        performer: 1,
        performerGender: 1,
        performerAge: 1,
        province: 1,
        city: 1,
        description: 1,
        images: 1,
        video: 1,
        audio: 1,
        likeNum: 1,
        commentNum: 1,
        collectionNum: 1,
        createTime: 1
      }
    }
  ).exec()
    .then(data => {
      if (data) {
        res.json({
          code: 0,
          message: 'ok',
          result: {
            upUser: {
              userId: data[0].upUser.userId,
              nickname: data[0].upUser.nickname,
              avatar: data[0].upUser.avatar,
              identity: data[0].upUser.identity
            },
            title: data[0].title,
            type: data[0].workType,
            performer: data[0].performer,
            performerGender: data[0].performerGender,
            performerAge: data[0].performerAge,
            province: data[0].province,
            city: data[0].city,
            description: data[0].description,
            images: data[0].images,
            video: data[0].video,
            audio: data[0].audio,
            likeNum: data[0].likeNum,
            commentNum: data[0].commentNum,
            collectionNum: data[0].collectionNum,
            createTime: data[0].createTime
          }
        })
      }
      else {
        res.json(ErrMsg.DB);
      }
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/addWorkComment', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {workId, content, audio} = req.body;

  if (!workId || !content) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let workComment = new WorkComment({
    userId: req.user_id,
    workId: workId,
    content: content,
    audio: audio
  });

  workComment.save()
    .then((data) => {
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
});

module.exports = router;