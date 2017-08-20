/**
 * Created by jialing on 2017/8/17.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const userService = require('../service/user');
const Activity = require('../models/activity');
const UserMsg = require('../models/userMsg');
const ChatMsg = require('../models/chatMsg');

router.post('/get', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {chatUserId, action, timestamp} = req.body;
  if (!chatUserId || !action || !timestamp) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  if (action !== 'refresh' && action !== 'more') {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let pageSize;
  try {
    pageSize = Number(req.body.pageSize) || 10;
  }
  catch (err) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  Promise.all([
    ChatMsg.find({
      $or: [
        {sendUserId: chatUserId, recvUserId: req.user._id},
        {sendUserId: req.user._id, recvUserId: chatUserId}
      ],
      msgCreateTime: action === 'refresh' ? {$gt: timestamp} : {$lt: timestamp}
    })
      .select('_id sendUserId recvUserId msgType msgResult msgContent msgContentId msgCreateTime')
      .limit(pageSize)
      .exec(),
    ChatMsg.count({
      $or: [
        {sendUserId: chatUserId, recvUserId: req.user._id},
        {sendUserId: req.user._id, recvUserId: chatUserId}
      ]
    }).exec()
  ])
    .then(data => {
      res.json({
        code: 0,
        message: true,
        result: {
          total: data[1],
          action,
          timestamp,
          pageSize: data[0].length,
          chatUserId,
          data: data[0]
        }
      })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })

});

router.post('/send', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {chatUserId, content, type} = req.body;
  if (!chatUserId || !type) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  if (type !== 'text' || type !== 'photo' || type !== 'audio' || type !== 'video') {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let msg = new ChatMsg({
    sendUserId: req.user._id,
    recvUserId: chatUserId,
    msgType: type,
    msgContent: content,
  })

  userService.sendChatMsg(msg)
    .then(r => {
      res.json({
        code: 0,
        message: 'ok',
        result: r
      })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/handle', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {msgId, result} = req.body;
  if (!msgId || !result) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  if (result !== 'yes' || result !== 'no') {
    res.json(ErrMsg.PARAMS);
    return;
  }

  ChatMsg.findOne({_id: msgId, recvUserId: req.user._id})
    .then(p => {
      if (!p) {
        res.json(ErrMsg.NotFound)
      }
      else if (p.msgResult) {
        res.json({
          code: -1,
          message: '已处理过的消息'
        })
      }
      else {
        //保存消息处理状态
        p.msgResult = result;

        //发送消息处理结果给对方
        let msg = new ChatMsg({
          sendUserId: req.user._id,
          recvUserId: p.sendUserId,
          msgType: 'handle-' + p.msgType,
          msgContent: p.msgContent,
          msgContentId: p.msgContentId,
          msgResult: result
        });

        //如果处理结果为yes，更新信息
        let handlePromise;
        if (result === 'ok') {
          if (p.msgType === 'authentication') {
            //认证信息通过，更新认证人信息
            handlePromise = userService.authentication(p.sendUserId, JSON.parse(p.msgContent));
          }
          else if (p.msgType === 'committee') {
            //同意成为组委会，更新标志位
            handlePromise = Activity.updateOne({_id: p.msgContentId, 'committee.userId': req.user._id},
              {$set: {'committee.$.isAgree': true}})
              .exec()
          }
        }

        return Promise.all([
          p.save(),
          userService.sendChatMsg(msg),
          handlePromise
        ])
      }
    })
    .then(data => {
      if (!data)
        return;

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
});


module.exports = router;