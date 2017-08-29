/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const uuid = require('uuid');
const userService = require('../service/user');
const User = require('../models/user');
const UserMsg = require('../models/userMsg');
const ChatMsg = require('../models/chatMsg');
const Kid = require('../models/kid');

router.post('/register', function (req, res) {

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
          code: -2,
          message: '手机号已注册'
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
            res.json(ErrMsg.DB);
            console.log(err.message);
          })
      }
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    });
});

router.post('/login', function (req, res) {
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
      res.json(ErrMsg.DB);
      console.log(err.message);
    });
});

router.post('/homepage', function (req, res) {
  const {uid} = req.body;

  User.aggregate([
    {$match: {_id: mongoose.Types.ObjectId(uid)}},
    {
      $project: {
        _id: 1,
        avatar: 1,
        nickname: 1,
        activeValue: 1,
        identity: 1,
        fansNum: {$size: '$fansId'},
        followNum: {$size: '$followId'}
      }
    }
  ])
    .exec()
    .then(u => {
      if (u.length)
        res.json({
          code: 0,
          message: 'ok',
          result: u[0]
        });
      else {
        res.json(ErrMsg.NotFound)
      }
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/userInfo', function (req, res) {
  const {uid} = req.body;

  User.findOne({_id: uid})
    .select('_id birthday gender address company job introduction')
    .exec()
    .then(u => {
      if (u)
        res.json({
          code: 0,
          message: 'ok',
          result: u
        });
      else {
        res.json(ErrMsg.NotFound)
      }
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/verifyCode', function (req, res) {
  // const {phone} = req.body;

  //随机一个四位数
  // let code = Math.round(Math.random() * 10000);

  //todo request send message

  res.json({
    code: 0,
    message: 'ok',
    result: true
  })
});

router.post('/kidInfo', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  Kid.findOne({_id: req.user.kidId, userId: req.user._id})
    .select('kidName kidGender kidBirthday kidHobby kidSchool kidClass kidTeacher kidCounselor introduction')
    .exec()
    .then(kid => {
      res.json({
        code: 0,
        message: 'ok',
        result: kid
      });
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    });
});

router.post('/authentication', function (req, res) {
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

  for (let i = 0, len = req.user.identity.length; i < len; i++) {
    if (req.user.identity[i] === identity) {
      res.json({
        code: -1,
        message: '您已认证过此身份'
      });
      return;
    }
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
            code: -2,
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
            msgContent: JSON.stringify({
              identity,
              realName,
              company,
              job
            })
          });
          userService.sendChatMsg(msg)
            .then(r => {
              res.json({
                code: 0,
                message: 'ok',
                result: true
              })

              // 临时代码 直接通过认证
              // req.user.identity.push(identity);
              // req.user.realName = realName;
              // req.user.company = company;
              // req.user.job = job;
              // return req.user.save()
            })
            .catch(err => {
              res.json(ErrMsg.DB);
              console.log(err.message);
            })
        }
      } else {
        res.json({
          code: -3,
          message: '推荐人不存在'
        })
      }
    })
});

router.post('/resetPassword', function (req, res) {
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
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});


router.post('/qnSignature', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {bucket, ext} = req.body;

  if (!bucket || !ext) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let result = userService.getQiniuToken(bucket, ext);
  res.json({
    code: 0,
    message: 'ok',
    result
  })

});

router.post('/follow', function (res, req) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {action, userId} = req.body;
  if (!userId || !action) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  if (action !== 'yes' && action !== 'no') {
    res.json(ErrMsg.PARAMS);
    return;
  }

  User.findOne({_id: userId}, '_id')
    .exec()
    .then(u => {
      if (u) {
        let isFollow = action === 'yes';
        return Promise.all([
          User.updateOne({_id: req.user._id}, isFollow ? {$addToSet: {followId: u._id}} : {$pull: {followId: u._id}}),
          User.updateOne({_id: u._id}, isFollow ? {$addToSet: {fansId: req.user._id}} : {$pull: {followId: req.user._id}})
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

router.post('/modifyUserInfo', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {birthday, gender, address, company, job, introduction} = req.body;

  User.updateOne({_id: req.user._id}, {birthday, gender, address, company, job, introduction})
    .then(() => {
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

router.post('/modifyKidInfo', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {introduction, kidBirthday, kidClass, kidCounselor, kidGender, kidHobby, kidName, kidSchool, kidTeacher} = req.body;

  userService.addKidInfo(req.user._id, {
    introduction,
    kidBirthday,
    kidClass,
    kidCounselor,
    kidGender,
    kidHobby,
    kidName,
    kidSchool,
    kidTeacher
  })
    .then(() => {
      res.json({
        code: 0,
        message: 'ok',
        result: true
      })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    });
});

module.exports = router;
