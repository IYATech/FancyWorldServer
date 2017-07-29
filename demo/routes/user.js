/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = require('../models/user');

router.post('/register', function (req, res, next) {
  const {phone, password, nickname, verifycode} = req.body;

  if (!phone || !password || !nickname || !verifycode) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  if (verifycode !== '1234') {
    res.json({
      'code': -1,
      'message': '验证码错误'
    });
    return;
  }

  u = new User({
    phone,
    password,
    nickname
  });

  u.save(function (err, product) {
    if (err)
      res.json({
        'code':-1,
        'message': '注册失败，用户已存在'
      })
    else
      res.json({
        'code': 0,
        'message': 'ok',
        'result': product._id
      })
  })
});

router.post('/login', function (req, res, next) {
  const {phone, password} = req.body;

  if (!phone || !password) {
    res.json(ErrMsg.PARAMS)
    return;
  }

  User.findOne({phone, password}, function (err, u) {
    if (err) {
      res.json({
        'code':ErrMsg.DB.code,
        'message': err.message
      })
    }
    else if (u) {
      res.json({
        'code':0,
        'message':'ok',
        'result': u
      })
    }
    else {
      res.json({
        'code': -1,
        'message': '用户名或密码错误'
      })
    }
  })
});

module.exports = router;
