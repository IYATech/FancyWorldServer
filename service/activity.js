/**
 * Created by jialing on 2017/8/2.
 */

const Activity = require('../models/activity');
const Post = require('../models/post');

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

/**
 * 是否为活动创建者
 * @param activityId
 * @param userId
 * @returns {Promise}
 */
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

/**
 * 发帖子/发言
 * @param postInfo
 * @returns {Promise}
 */
exports.addPost = function (postInfo) {
  return new Promise(function (resolve, reject) {
    let model = GetModel(postInfo.segmentType);
    if (!model) {
      reject(new Error('segmentType is not correct'));
    }
    else {
      model.findOne({_id: postInfo.segmentId})
        .select('_id postNum')
        .then(data => {
          if (data) {
            data.postNum += 1;
            return Promise.all([
              new Post(postInfo).save(),
              data.save()
            ])
          }
          else
            throw new Error('activity or segment is not found')
        })
        .then(data => {
          resolve(data[0]);
        })
        .catch(err => reject(err))
    }
  })
};

/**
 * 回帖/留言
 * @param commentInfo
 * @returns {Promise}
 */
exports.commentPost = function (commentInfo) {
  return new Promise(function (resolve, reject) {
    Post.findOne({_id: commentInfo.postId})
      .then(p => {
        if (p) {
          p.commentNum += 1;
          return Promise.all([
            new Comment(commentInfo).save(),
            p.save()
          ])
        }
        else
          throw new Error('post is not found');
      })
      .then((data) => resolve(data[0]))
      .catch(err => reject(err))
  });
};