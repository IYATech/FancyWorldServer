/**
 * Created by jialing on 2017/8/2.
 */

const User = require('../models/user');
const UserMsg = require('../models/userMsg');
const ChatMsg = require('../models/chatMsg');
const Kid = require('../models/kid');
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

/**
 *
 * @param userId
 * @param info
 * @returns {Promise}
 */
exports.authentication = function (userId, info) {
  return new Promise(function (resolve, reject) {
    const {identity, realName, company, job} = info;
    User.updateOne({_id: userId}, {$addToSet: {identity}, realName, company, job})
      .exec()
      .then(p => resolve(p.n))
      .catch(err => reject(err))
  });
};

/**
 * 发送消息
 * @param msgObj
 * @returns {Promise}
 */
exports.sendChatMsg = function (msgObj) {
  return new Promise(function (resolve, reject) {
    let msg;
    new ChatMsg(msgObj).save()
      .then((m) => {
        msg = m;
        return UserMsg.findOneAndUpdate({userId: msgObj.recvUserId}, {$inc: {chatMsgNum: 1}}).exec();
      })
      .then(() => {
        resolve(msg)
      })
      .catch(err => reject(err))
  })
};

/**
 * 增加孩子信息
 * @param userId
 * @param kidInfo
 * @returns {Promise}
 */
exports.addKidInfo = function (userId, kidInfo) {
  return new Promise(function (resolve, reject) {
    Kid.findOne({userId})
      .exec()
      .then(k => {
        if (k) {
          Kid.updateOne({userId}, kidInfo)
            .exec()
            .then(() => resolve(true))
            .catch(err => reject(err))
        }
        else {
          kidInfo.userId = userId;
          new Kid(kidInfo).save()
            .then(p => {
              return User.update({_id: userId}, {kidId: p._id}).exec()
            })
            .then(() => resolve(true))
            .catch((err) => reject(err))
        }
      })
      .catch(err => reject(err))
  })
};