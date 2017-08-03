/**
 * Created by jialing on 2017/8/2.
 */

const Activity = require('../models/activity');

/**
 * 用户是否有权查看活动
 * @param activityId 活动ID
 * @param userId 用户ID
 * @returns {Promise}
 */
exports.hasPermission = function (activityId, userId) {
  let conditions;
  if (userId) {
    conditions = {
      _id: activityId,
      $or: [
        {createrId: {$eq: userId}}, //创建者
        {committee: {$elemMatch: {userId}}}, //组委会成员
        {$and: [{visibleUserId: {$size: 0}}, {invisibleUserId: {$size: 0}}]}, //没有设置门槛
        {$and: [{visibleUserId: {$not: {$size: 0}}}, {visibleUserId: {$elemMatch: {$eq: userId}}}]}, //设置了可见组，且用户在组内
        {$and: [{invisibleUserId: {$not: {$size: 0}}}, {invisibleUserId: {$not: {$elemMatch: {$eq: userId}}}}]}  //设置了不可见组，用户不在组内
      ]
    }
  } else {
    conditions = {
      _id: activityId,
      $and: [{visibleUserId: {$size: 0}}, {invisibleUserId: {$size: 0}}], //没有设置门槛
    }
  }

  return new Promise(function (resolve, reject) {
    Activity.findOne(conditions, '_id')
      .exec()
      .then(data => {
        resolve(!!data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

exports.isActivityCreater = function (activityId, userId) {
  return new Promise(function (resolve, reject) {
    Activity.findOne({_id: activityId, createrId: userId}, '_id')
      .exec()
      .then(data => {
        resolve(!!data)
      })
      .catch(err => {
        reject(err)
      })
  })
};