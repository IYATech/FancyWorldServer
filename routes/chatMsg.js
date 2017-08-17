/**
 * Created by jialing on 2017/8/17.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const UserMsg = require('../models/userMsg');
const ChatMsg = require('../models/chatMsg');

router.post('/get', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.PARAMS);
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
    res.json(ErrMsg.PARAMS);
    return;
  }


});


module.exports = router;