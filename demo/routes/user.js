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
      code: -1,
      message: '验证码错误'
    });
    return;
  }

  User.findOne({phone})
    .then(u => {
      if (u) {
        res.json({
          code: -1,
          message: '该手机号已注册'
        });
      }
      else {
        let user = new User({
          phone,
          password,
          nickname
        });

        user.save()
          .then(p => {
            res.json({
              code: 0,
              message: 'ok',
              result: p._id
            })
          })
          .catch(err => {
            res.json({
              code: ErrMsg.DB.code,
              message: err.message
            });
          })
      }
    })
    .catch(err => {
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      });
    });
});

router.post('/login', function (req, res, next) {
  const {phone, password} = req.body;

  if (!phone || !password) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  User.findOne({phone, password})
    .then(u => {
      if (u) {
        res.json({
          code: 0,
          message: 'ok',
          result: u
        })
      }
      else {
        res.json({
          code: -1,
          message: '用户名或密码错误'
        })
      }
    })
    .catch(err => {
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      })
    });
});

router.post('/userinfo', function (req, res, next) {
  const {uid} = req.body;

  User.findOne({_id: uid}, '_id avatar nickname fansnum follownum activevalue')
    .then(u => {
      if (u)
        res.json({
          code: 0,
          message: 'ok',
          result: {
            _id: u._id,
            nickname: u.nickname,
            avatar: u.avatar || '',
            fansnum: u.fansnum || 0,
            follownum: u.follownum || 0,
            activevalue: u.activevalue || 0
          }
        });
      else {
        res.json({
          code: -1,
          message: '用户不存在',
        })
      }
    })
    .catch(err => {
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      })
    })
});


module.exports = router;
