/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const User = require('../models/user');

router.post('/register', function (req, res, next) {

  const {phone, password, nickname, verifyCode} = req.body;

  if (!phone || !password || !nickname || !verifyCode) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  if (verifyCode !== '1234') {
    res.json({
      code: -1,
      message: '验证码错误'
    });
    return;
  }

  User.findOne({phone}).exec()
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

  let accessToken = uuid.v4();
  User.findOneAndUpdate({phone, password}, {accessToken}).exec()
    .then(u => {
      if (u) {
        u.accessToken = accessToken;
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

router.post('/homepage', function (req, res, next) {
  const {uid} = req.body;

  User.findOne({_id: uid}, '_id avatar nickname fansNum followNum activeValue').exec()
    .then(u => {
      if (u)
        res.json({
          code: 0,
          message: 'ok',
          result: {
            _id: u._id,
            nickname: u.nickname,
            avatar: u.avatar || '',
            fansNum: u.fansNum || 0,
            followNum: u.followNum || 0,
            activeValue: u.activeValue || 0
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

router.post('/userInfo', function (req, res, next) {
  const {uid} = req.body;

  User.findOne({_id: uid}, '_id birthday gender address company job introduction').exec()
    .then(u => {
      if (u)
        res.json({
          code: 0,
          message: 'ok',
          result: {
            _id: u._id,
            birthday: u.birthday,
            gender: u.gender,
            address: u.address,
            company: u.company,
            job: u.job,
            introduction: u.introduction,
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

router.post('/verifyCode', function (req, res, next) {
  const {phone} = req.body;

  //todo
  res.end();
});

router.post('/kidInfo', function (req, res, next) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {uid} = req.body;

  //todo

  res.end();
});

router.post('/authentication', function (req, res, next) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  //todo

  res.end();
});

router.post('/resetPassword', function (req, res, next) {
  const {phone, password, verifyCode} = req.body;

  if (!phone || !password || !verifyCode) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  if (verifyCode !== '1234') {
    res.json({
      code: -1,
      message: '验证码错误'
    });
    return;
  }

  User.update({phone/*,verifyCode*/}, {password}).exec()
    .then(() => {
      res.json({
        code: 0,
        message: 'ok',
        result: true
      })
    })
    .catch(err => {
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      })
    })
});

router.post('/qnSignature', function (req, res, next) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {type, ext} = res.body;

  if (!type || !ext) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  res.json({
    code: 0,
    message: 'ok',
    result:getQiniuToken(type, ext)
  })

});

module.exports = router;
