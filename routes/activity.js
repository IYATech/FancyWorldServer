/**
 * Created by jialing on 2017/7/31.
 */

const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const UserMsg = require('../models/userMsg');
const ChatMsg = require('../models/chatMsg');
const _ = require('lodash');

router.post('/add', function (req, res, next) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  if (req.user.identity.length === 0) {
    res.json({
      code: -1,
      message: '您没有进行认证，请先认证您的身份'
    });
    return;
  }

  const {
    title, tag, committeeUserId, sponsor, undertaker,
    description, images, audio, thumbnail, video,
    customEnrollInfo, endTime, invisibleUserId, visibleUserId
  } = req.body;

  if (!title || !tag || !committeeUserId || !sponsor || !undertaker ||
    !description || !customEnrollInfo || !endTime || !invisibleUserId || !visibleUserId) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let activity = new Activity({
    createrId: req.user._id,
    title,
    tag,
    status: 'save',
    committeeId: committeeUserId,
    description,
    images,
    audio,
    thumbnail,
    video,
    sponsor,
    undertaker,
    customEnrollInfo,
    invisibleUserId,
    visibleUserId,
    enrollInfoId: [],
    segment: [],
    endTime,
  });

  let result = '';
  activity.save()
    .then(data => {
      result = data._id;
      // 给组委会成员发消息
      return Promise.all(
        committeeUserId.map((uid) => {
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
        committeeUserId.map((uid) => {
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
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      })
    });
});

router.post('/get', function (req, res, next) {
  const {activityId} = req.body;

  if (!activityId) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  Activity.findById(activityId)
    .populate({
      path:'committeeId',
      select:'_id nickname avatar identity'
    })
    .then(data => {
        if (!data) {
          res.json({
            code: -1,
            message: '活动不存在'
          });
          return;
        }

        if (req.user) {
          const uid = req.user._id;
          //登录用户是 创建者 或 可见用户 或 非不可见用户
          if (uid === data.createrId || _.includes(data.visibleUserId, uid) || !_.includes(data.invisibleUserId, uid)) {
            res.json({
              code: 0,
              message: 'ok',
              result: data
            });
          } else {
            res.json({
              code: -2,
              message: '无权查看此活动'
            });
          }
        } else {
          //非登录用户，没有门槛，可以取到数据
          if (data.visibleUserId.length === 0 && data.invisibleUserId.length === 0) {
            res.json({
              code: 0,
              message: 'ok',
              result: data
            });
          } else {
            res.json({
              code: -2,
              message: '无权查看此活动'
            });
          }
        }
      }
    )
});

module.exports = router;