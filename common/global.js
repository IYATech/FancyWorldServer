/**
 * Created by jialing on 2017/7/29.
 */

const User = require('../models/user');
const config = require('../common/config');
const qiniu = require('qiniu');
const uuid = require('uuid');

qiniu.conf.ACCESS_KEY = config.qiniu.AK;
qiniu.conf.SECRET_KEY = config.qiniu.SK;

/*
  define error code
 */
global.ErrMsg = {
  PARAMS: {
    code: -1001,
    message: 'params error'
  },
  DB: {
    code: -1002,
    message: 'database error'
  },
  Token: {
    code: -1003,
    message: 'no login'
  }
};

/*
  define user identity weight
 */
global.IdentityWeight = {
  'patriarch':1,
  'teacher':2,
  'expert':3,
  'leader':3
};

/**
 * token check before router
 * @param req
 * @param res
 * @param next
 */
global.checkToken = function (req, res, next) {
  const accessToken = req.header('x-token');
  if (accessToken) {
    User.findOne({accessToken}).exec()
      .then(u => {
        if (u)
          req.user = u;
        next();
      })
      .catch(err => {
        res.json({
          code: ErrMsg.DB.code,
          message: err.message
        });
        res.end();
      })
  }
  else
    next();
};

/**
 * 获取七牛云的上传签名
 * @param type file type
 * @param ext file extension
 * @returns {{token, key: string}}
 */
global.getQiniuToken = function (type, ext) {
  let key = uuid.v4() + '.' + ext;
  let putPolicy = new qiniu.rs.PutPolicy(type + ':' + key);

  let token = putPolicy.token();
  return {
    token: token,
    key: key
  }
};


module.exports = global;