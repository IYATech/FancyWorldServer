/**
 * Created by jialing on 2017/8/2.
 */

const User = require('../models/user');
const config = require('../common/config');
const qiniu = require('qiniu');
const uuid = require('uuid');

/**
 * token check before router
 * @param req
 * @param res
 * @param next
 */
exports.checkToken = function (req, res, next) {
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
 * @param bucket
 * @param ext
 * @returns {{token: string, key: string, host: string}}
 */
exports.getQiniuToken = function (bucket, ext) {
  let mac = new qiniu.auth.digest.Mac(config.qiniu.AK, config.qiniu.SK);

  let keyToOverwrite = uuid.v4() + '.' + ext;
  let options = {
    scope: bucket + ":" + keyToOverwrite
  };
  let putPolicy = new qiniu.rs.PutPolicy(options);
  let uploadToken = putPolicy.uploadToken(mac);

  return {
    token: uploadToken,
    key: keyToOverwrite,
    host: config.qiniu.upload
  }
};