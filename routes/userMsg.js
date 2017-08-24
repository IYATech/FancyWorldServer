/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const UserMsg = require('../models/userMsg');
const ChatMsg = require('../models/chatMsg');

router.post('/new', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  UserMsg.findOneAndUpdate({userId: req.user._id}, {lastTime: Date.now()})
    .select('userId newLikeMsgNum newFollowMsgNum newLeaveMsgNum newNoticeMsgNum chatMsgNum lastTime')
    .exec()
    .then(data => {
      if (data) {
        res.json({
          code: 0,
          message: 'ok',
          result: data
        })
      }
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    });
});

router.post('/recentChat', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  let {action} = req.body;
  if (action !== 'refresh' && action !== 'more') {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let pageSize, timestamp;
  try {
    pageSize = Number(req.body.pageSize) || 0;
    timestamp = req.body.timestamp || 0;
  }
  catch (err) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  ChatMsg.aggregate([
    {
      $match: {
        $or: [{sendUserId: req.user._id}, {recvUserId: req.user._id}]
      }
    },
    {
      $project: {
        msgType: 1,
        msgResult: 1,
        msgContent: 1,
        msgContentId: 1,
        msgCreateTime: 1,
        user: {
          $cond: {if: {$eq: ['$sendUserId', req.user._id]}, then: '$recvUserId', else: '$sendUserId'}
        }
      }
    },
    {
      $group: {
        _id: '$user',
        msgCreateTime: {$last: '$msgCreateTime'},
        msgId: {$last: '$_id'},
        msgType: {$last: '$msgType'},
        msgResult: {$last: '$msgResult'},
        msgContent: {$last: '$msgContent'},
        msgContentId: {$last: '$msgContentId'},
      }
    },
    {
      $match: {
        msgCreateTime: action === 'refresh' ? {$gt: new Date(timestamp)} : {$lt: new Date(timestamp)}
      }
    },
    {$limit: pageSize},
    {
      $lookup: {
        from: User.collection.collectionName,
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $project: {
        _id: '$msgId',
        msgType: 1,
        msgResult: 1,
        msgContent: 1,
        msgContentId: 1,
        msgCreateTime: 1,
        user: {$arrayElemAt: ['$user', 0]}
      }
    },
    {
      $project: {
        msgType: 1,
        msgResult: 1,
        msgContent: 1,
        msgContentId: 1,
        msgCreateTime: 1,
        user: {_id: 1, nickname: 1, avatar: 1, identity: 1}
      }
    },
  ])
    .exec()
    .then(data => {
      res.json({
        code: 0,
        message: 'ok',
        result: {
          action,
          timestamp,
          pageSize: data.length,
          data
        }
      })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});


module.exports = router;
