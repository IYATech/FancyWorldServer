/**
 * Created by jialing on 2017/7/31.
 */

const express = require('express');
const router = express.Router();
const activityService = require('../service/activity');
const Activity = require('../models/activity');
const UserMsg = require('../models/userMsg');
const ChatMsg = require('../models/chatMsg');
const EnrollInfo = require('../models/enrollInfo');
const Kid = require('../models/kid');

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
      // 给组委会成员发消息
      return Promise.all(
        committeeId.map((uid) => {
          let msg = new ChatMsg({
            sendUserId: req.user._id,
            recvUserId: uid,
            msgType: 'committee',
            msgResult: '',
            msgContent: title,
            msgContentId: data._id
          });

          return msg.save();
        })
      );
    })
    .then(() => {
      // 给组委会成员的消息数加1
      return Promise.all(
        committeeId.map((uid) => {
          return UserMsg.update({userId: uid}, {$inc: {chatMsgNum: 1}}).exec();
        })
      );
    })
    .then(() => {
      res.json({
        code: 0,
        message: 'ok',
        result
      });
    })
    .catch(err => {
      res.json(ErrMsg.DB)
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
      .limit(pageSize)
      .skip(pageSize * page)
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
    res.json(ErrMsg.PARAMS)
    return;
  }

  EnrollInfo.findOne({activityId, enrollUserId: req.user._id}, '_id')
    .then(data => {
      if (data) {
        res.json({
          code: -1,
          message: '您已经报过名了'
        })
        return;
      }
      let enrollInfo = new EnrollInfo({
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
      });
      enrollInfo.save()
        .then(p => {
          if (req.user.kidId.length === 0) {
            //用户尚未创建孩子信息，自动创建
            let kid = new Kid({
              userId: [req.user._id],
              kidName,
              kidBirthday,
              kidGender,
              kidHobby,
              kidSchool,
              kidClass,
              kidTeacher
            })
            kid.save()
              .then(k => {
                req.user.kidId.push(k._id);
                return req.user.save()
              })
              .then(u => {

              })
              .catch(err => {
                console.log(err.message);
              })
          }
          res.json({
            code: 0,
            message: 'ok',
            result: true
          })
        })
        .catch(err => {
          res.json(ErrMsg.DB);
          console.log(err.message);
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
      Promise.all([
        EnrollInfo.find({activityId})
          .select('_id enrollUserId activityId kidName kidGender kidBirthday kidSchool kidClass kidTeacher kidHobby customEnrollInfo createTime')
          .sort({createTime: 'desc'})
          .limit(pageSize)
          .skip(page * pageSize)
          .populate([
            {path: 'enrollUserId', select: '_id nickname avatar identity'}
          ]),
        EnrollInfo.count({activityId}).exec()
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
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});


module.exports = router;