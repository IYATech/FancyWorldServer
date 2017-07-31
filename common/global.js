/**
 * Created by jialing on 2017/7/29.
 */

const User = require('../models/user');
const config = require('../common/config');
const qiniu = require('qiniu');

qiniu.conf.ACCESS_KEY = config.qiniu.AK;
qiniu.conf.SECRET_KEY =  config.qiniu.SK;

/*
  define error code
 */
global.ErrMsg = {
  PARAMS: {
    code: -1001,
    message: '参数错误'
  },
  DB: {
    code: -1002,
    message: '数据操作异常'
  },
  Token: {
    code: -1003,
    message: '未登录'
  }
};

global.checkToken = function (req, res, next) {
  const accessToken = req.header('x-token');
  if (accessToken) {
    User.findOne({accessToken})
      .then(u=>{
        if(u)
          req.user = u;
        next();
      })
      .catch(err=>{
        res.json({
          code:ErrMsg.DB.code,
          message:err.message
        });
        res.end();
      })
  }
  else
    next();
};

global.getQiniuToken = function(type,ext) {
  let key = uuid.v4() + '.' + ext;
  let putPolicy = new qiniu.rs.PutPolicy(type + ':' + key);;

  let token = putPolicy.token();
  return {
    token: token,
    key: key
  }
};


module.exports = global;