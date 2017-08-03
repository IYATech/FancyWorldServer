/**
 * Created by jialing on 2017/7/31.
 */

const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const UserMsg = require('../models/userMsg');
const ChatMsg = require('../models/chatMsg');
const EnrollInfo = require('../models/enrollInfo');

router.post('/add', function (req, res) {
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
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      })
    });
});

router.post('/get', function (req, res) {
  const {activityId} = req.body;

  if (!activityId) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let conditions;
  if (req.user) {
    //登录用户
    conditions = {
      _id: activityId,
      $or: [
        {createrId: {$eq: req.user._id}}, //创建者
        {committee: {$elemMatch: {userId: req.user._id}}}, //组委会成员
        {$and: [{visibleUserId: {$size: 0}}, {invisibleUserId: {$size: 0}}]}, //没有设置门槛
        {$and: [{visibleUserId: {$not: {$size: 0}}}, {visibleUserId: {$elemMatch: {$eq: req.user._id}}}]}, //设置了可见组，且用户在组内
        {$and: [{invisibleUserId: {$not: {$size: 0}}}, {invisibleUserId: {$not: {$elemMatch: {$eq: req.user._id}}}}]}  //设置了不可见组，用户不在组内
      ]
    }
  } else {
    //非登录用户
    conditions = {
      _id: activityId,
      $and: [{visibleUserId: {$size: 0}}, {invisibleUserId: {$size: 0}}], //没有设置门槛
    }
  }

  Promise.all([
    Activity.findOne(conditions)
      .select('_id title tag status committee description images audio video sponsor undertaker viewNum signUpNum collectionNum segment createTime endTime postNum')
      .populate([
        {path: 'committee.userId', select: '_id nickname avatar identity'},
        {path: 'createrId', select: '_id nickname avatar identity'}
      ]),
    EnrollInfo.count({activityId}).exec()
  ])

    .then(data => {
        if (!data[0]) {
          res.json({
            code: -1,
            message: '活动不存在或无权查看'
          });
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
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      });
    })
});

router.post('/myActivities', function (req, res) {
  if (!req.user) {
    res.json(Error.Token);
    return;
  }

  let {page, pageSize} = req.body;
  try {
    page = Number(page);
    pageSize = Number(pageSize);
  }
  catch (err) {
    res.json(ErrMsg.PARAMS);
  }

  Promise.all([
    Activity.find({createrId: req.user._id, status: {$ne: 'end'}})
      .select('_id title createTime endTime status')
      .sort({createTime: 'desc'})
      .limit(Number(pageSize))
      .skip(Number(page))
      .exec(),
    Activity.count({createrId: req.user._id, status: {$ne: 'end'}}).exec()
  ])
    .then(data => {
      res.json({
        code: 0,
        message: 'ok',
        result: {
          data: data[0],
          page,
          pageSize: data[0].length,
          total: data[1]
        }
      })
    })
    .catch(err => {
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      });
    });


});


module.exports = router;