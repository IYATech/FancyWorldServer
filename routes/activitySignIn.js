/**
 * Created by jialing on 2017/8/1.
 */

const express = require('express');
const router = express.Router();
const config = require('../common/config');
const Activity = require('../models/activity');
const ActivitySignIn = require('../models/activitySignIn');
const EnrollInfo = require('../models/enrollInfo');

router.post('/add', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {
    activityId, title, description, images, video,
    audio, lat, lng, address
  } = req.body;

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
        let signIn = new ActivitySignIn({
          createrId: req.user._id,
          activityId,
          title,
          description,
          images,
          audio,
          video,
          address,
          lat,
          lng,
        });
        let segmentId;
        signIn.save()
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

  ActivitySignIn.findOne({activityId, _id: segmentId})
    .select('_id createrId activityId title description images audio video createTime postNum lat lng address')
    .exec()
    .then(data => {
      if (data) {
        data._doc.qrcode = config.QRCode.url + `activityId%3D${activityId}%26segmentId%3D${segmentId}`;
        res.json({
          code: 0,
          message: 'ok',
          result: data
        });
      } else {
        res.json(ErrMsg.NotFound)
      }
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/signIn', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {activityId, segmentId} = req.body;
  if (!activityId || !segmentId) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  Promise.all([
    EnrollInfo.findOne({enrollUserId: req.user._id, activityId}, '_id').exec(),
    ActivitySignIn.findOne({activityId, _id: segmentId}, 'signedUser').exec()
  ])
    .then(data => {
      if (!data[0]) {
        //没有报名
        res.json(ErrMsg.Enroll)
      }
      else if (!data[1]) {
        //没有找到活动
        res.json(ErrMsg.NotFound)
      }
      else {
        let i = 0, len = data[1].signedUser.length;
        for (; i < len; i++) {
          if (data[1].signedUser[i] === req.user._id)
            break;
        }
        if (i < len) {
          //已经签过到
          res.json({
            code: 0,
            message: 'ok',
            result: true
          })
        }
        else {
          //还未签到，保存签到状态
          data[1].signedUser.push(req.user._id);
          data[1].save()
            .then(() => {
              res.json({code: 0, message: 'ok', result: true})
            })
            .catch(err => {
              res.json(ErrMsg.DB);
              console.log(err.message);
            })
        }
      }
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/signedUser', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {activityId, segmentId, flag} = req.body;
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

  ActivitySignIn.findOne({activityId, _id: segmentId}, 'signedUser').exec()
    .then(s => {
      let condition = flag ? {$in: s.signedUser} : {$nin: s.signedUser};
      Promise.all([
        EnrollInfo.find({activityId, enrollUserId: condition})
          .select('_id enrollUserId activityId kidName kidGender kidBirthday kidSchool kidClass kidTeacher kidHobby customEnrollInfo createTime')
          .sort({createTime: 'desc'})
          .skip(page * pageSize)
          .limit(pageSize)
          .populate([
            {path: 'enrollUserId', select: '_id nickname avatar identity'}
          ]),
        EnrollInfo.count({activityId, enrollUserId: {$in: s.signedUser}}).exec()
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