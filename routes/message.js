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

  UserMsg.findOne({userId: req.user._id}).exec()
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

router.post('/list', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  //todo
  ChatMsg.find({$or: [{sendUserId: req.user._id}, {recvUserId: req.user._id}]})
    .distinct('senderUserId')
    .populate([
      {path: 'senderUserId', select: '_id nickname avatar identity'},
      {path: 'recvUserId', select: '_id nickname avatar identity'}
    ])
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
    })

});

module.exports = router;
