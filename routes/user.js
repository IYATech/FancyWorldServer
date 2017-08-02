/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const User = require('../models/user');
const UserMsg = require('../models/userMsg');
const ChatMsg = require('../models/chatMsg');
const Kid = require('../models/kid');

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
          nickname,
          identity: []
        });

        user.save()
          .then(p => {
            res.json({
              code: 0,
              message: 'ok',
              result: p._id
            });

            let umsg = new UserMsg({
              userId: p._id
            });
            return umsg.save();
          })
          .then(() => {
            res.end();
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
        res.json({
          code: 0,
          message: 'ok',
          result: {
            _id: u._id,
            nickname: u.nickname,
            avatar: u.avatar,
            identity: u.identity,
            accessToken
          }
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

  //随机一个四位数
  let code = Math.round(Math.random() * 10000);

  //todo rquest send message

  res.json({
    code: 0,
    message: 'ok',
    result: true
  })
});

router.post('/kidInfo', function (req, res, next) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  Kid.find({userId: {$elemMatch: {$eq: req.user._id}}}).exec()
    .then(kid => {
      res.json({
        code: 0,
        message: 'ok',
        result: kid
      });
    })
    .catch(err => {
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      });
    });
});

router.post('/authentication', function (req, res, next) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {realName, company, job, identity, refereeName, refereePhone} = req.body;

  if (!realName || !identity || !refereeName || !refereePhone) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  //获取认证身份的权值
  const myWeight = IdentityWeight[identity];
  if (!myWeight) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  User.findOne({phone: refereePhone, realName: refereeName}).exec()
    .then(u => {
      if (u) {
        //获取推荐人多个认证身份中的最大权值
        let refWeight = 0;
        for (let i = 0, len = u.identity.length; i < len; i++) {
          const value = u.identity[i];
          if (IdentityWeight[value] && IdentityWeight[value] > refWeight)
            refWeight = IdentityWeight[value];
        }
        if (refWeight < myWeight) {
          res.json({
            code: -1,
            message: '该推荐人的身份权限不够'
          })
        }
        else {
          //允许认证，发送认证消息给推荐人
          let msg = new ChatMsg({
            sendUserId: req.user._id,
            recvUserId: u._id,
            msgType: 'authentication',
            msgResult: '',
            msgContent: identity,
          });

          msg.save()
            .then(() => {
              return UserMsg.update({userId: u._id}, {$inc: {chatMsgNum: 1}}).exec();
            })
            .then(() => {
              res.json({
                code: 0,
                message: 'ok',
                result: true
              })
            })
            .catch(err => {
              res.json({
                code: -1,
                message: err.message
              })
            })
        }
      } else {
        res.json({
          code: -1,
          message: '推荐人不存在'
        })
      }
    })
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
    result: getQiniuToken(type, ext)
  })

});

module.exports = router;
