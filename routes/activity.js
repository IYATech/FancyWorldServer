/**
 * Created by jialing on 2017/7/31.
 */

const express = require('express');
const router = express.Router();
const activityService = require('../service/activity');
const userService = require('../service/user');
const Activity = require('../models/activity');
const UserMsg = require('../models/userMsg');
const ChatMsg = require('../models/chatMsg');
const EnrollInfo = require('../models/enrollInfo');
const Event = require('../models/event');

router.post('/add', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  if (req.user.identity.length === 0) {
    res.json(ErrMsg.Identity);
    return;
  }

  const {
    title, tag, committeeId, sponsor, undertaker,
    description, images, audio, video,
    customEnrollInfo, endTime, invisibleUserId, visibleUserId
  } = req.body;

  if (!title || !tag || !committeeId || !sponsor || !undertaker ||
    !description || !customEnrollInfo || !endTime || !invisibleUserId || !visibleUserId) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let committee = committeeId.map(function (id) {
    return {userId: id, isAgree: false}
  });

  let activity = new Activity({
    createrId: req.user._id,
    title,
    tag,
    status: 'save',
    committee,
    description,
    images,
    audio,
    video,
    sponsor,
    undertaker,
    customEnrollInfo,
    invisibleUserId,
    visibleUserId,
    segment: [],
    endTime,
  });

  let result = '';
  activity.save()
    .then(data => {
      result = data._id;

      let msgArr = [];
      for (let i = 0; i < committeeId.length; i++) {
        msgArr.push({
          sendUserId: req.user._id,
          recvUserId: committeeId[i],
          msgType: 'committee',
          msgResult: '',
          msgContent: title,
          msgContentId: data._id
        })
      }

      return Promise.all([
        // 给组委会成员发消息
        ChatMsg.insertMany(msgArr),
        // 给组委会成员的消息数加1
        UserMsg.update({userId: {$in: committeeId}}, {$inc: {chatMsgNum: 1}}).exec()
      ])
    })
    .then(() => {
      let event = new Event({
        createrId: req.user._id,
        eventType: global.EventType.NewsTheme,
        activityId: result,
        segmentId: result,
        segmentTitle: activity.title,
        segmentText: activity.description,
        audio: activity.audio,
        video: activity.video,
        images: activity.images,
      });
      return event.save();
    })
    .then(() => {
      res.json({
        code: 0,
        message: 'ok',
        result
      });
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message)
    });
});

router.post('/get', function (req, res) {
  const {activityId} = req.body;

  if (!activityId) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  Promise.all([
    Activity.findById(activityId)
      .select('_id createrId segment title tag status committee description images audio video sponsor undertaker customEnrollInfo viewNum signUpNum collectionNum segment createTime endTime postNum')
      .populate([
        {path: 'committee.userId', select: '_id nickname avatar identity'},
        {path: 'createrId', select: '_id nickname avatar identity'}
      ]),
    EnrollInfo.count({activityId}).exec()
  ])
    .then(data => {
        if (!data[0]) {
          res.json(ErrMsg.NotFound);
          return;
        }
        data[0]._doc.enrollNum = data[1];
        res.json({
          code: 0,
          message: 'ok',
          result: data[0]
        });
      }
    )
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/myActivities', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
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

  Promise.all([
    Activity.find({createrId: req.user._id, status: {$ne: 'end'}})
      .select('_id title segment createTime endTime status')
      .sort({createTime: 'desc'})
      .skip(pageSize * page)
      .limit(pageSize)
      .exec(),
    Activity.count({createrId: req.user._id, status: {$ne: 'end'}}).exec()
  ])
    .then(data => {
      res.json({
        code: 0,
        message: 'ok',
        result: {
          page,
          pageSize: data[0].length,
          total: data[1],
          data: data[0],
        }
      })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    });
});

router.post('/enroll', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {activityId, kidName, kidGender, kidBirthday, kidSchool, kidClass, kidTeacher, kidHobby, customEnrollInfo} = req.body;

  if (!activityId || !kidName || !kidGender || !kidBirthday || !kidSchool || !kidClass || !kidTeacher || !kidHobby) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  EnrollInfo.findOne({activityId, enrollUserId: req.user._id}, '_id')
    .then(data => {
      if (data) {
        res.json({
          code: -1,
          message: '您已经报过名了'
        });
        return;
      }

      return new EnrollInfo({
        enrollUserId: req.user._id,
        activityId,
        kidName,
        kidGender,
        kidBirthday,
        kidSchool,
        kidClass,
        kidTeacher,
        kidHobby,
        customEnrollInfo
      }).save();
    })
    .then(p => {
      if (!p)
        return;
      res.json({
        code: 0,
        message: 'ok',
        result: true
      });

      if (!req.user.kidId) {
        //用户尚未创建孩子信息，自动创建
        let kid = {
          kidName,
          kidBirthday,
          kidGender,
          kidHobby,
          kidSchool,
          kidClass,
          kidTeacher
        };
        userService.addKidInfo(req.user._id, kid)
          .catch(err => console.log(err.message));
      }

      Activity.findOne({_id: activityId})
        .then(data => {
          if (data) {
            let event = new Event({
              createrId: req.user.id,
              eventType: global.EventType.NewsEnroll,
              activityId: activityId,
              segmentId: activityId,
              segmentTitle: data.title,
              segmentText: data.description,
              video: data.video,
              performer: data.performer
            });
            return event.save();
          }
        })
        .catch(err => {
          console.log(err.message)
        })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/enrollUser', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {activityId} = req.body;
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
    return;
  }

  activityService.isActivityCreater(activityId, req.user._id)
    .then(result => {
      if (!result) {
        res.json(ErrMsg.Permission);
        return;
      }

      return Promise.all([
        EnrollInfo.find({activityId})
          .select('_id enrollUserId activityId kidName kidGender kidBirthday kidSchool kidClass kidTeacher kidHobby customEnrollInfo createTime')
          .sort({createTime: 'desc'})
          .skip(page * pageSize)
          .limit(pageSize)
          .populate([
            {path: 'enrollUserId', select: '_id nickname avatar identity'}
          ]),
        EnrollInfo.count({activityId}).exec()
      ])
    })
    .then(data => {
      if (!data)
        return;

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