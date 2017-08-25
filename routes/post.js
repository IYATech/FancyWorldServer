/**
 * Created by jialing on 2017/8/2.
 */

const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const activityService = require('../service/activity');
const userService = require('../service/user');
const Activity = require('../models/activity');

router.post('/add', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {segmentId, segmentType, content, images, audio} = req.body;
  if (!segmentType || !segmentId || !GetModel(segmentType)) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  if (!content && !images && !audio) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  activityService.addPost({
    createrId: req.user._id,
    segmentId,
    segmentType,
    content,
    images,
    audio
  })
    .then(p => {
      res.json({
        code: 0,
        message: 'ok',
        result: p._id
      })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/getById', function (req, res) {
  const {postId} = req.body;
  if (!postId) {
    res.json(ErrMsg.PARAMS);
    return;
  }
  Post.findOne({_id, postId})
    .select('_id createrId segmentType segmentId content images audio commentNum likeNum createTime')
    .exec()
    .then(p => {
      res.json({
        code: 0,
        message: 'ok',
        result: p
      })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/postList', function (req, res) {
  const {segmentId, segmentType, action} = req.body;
  if (!segmentId || !segmentType || !action || !GetModel(segmentType)) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  if (action !== 'refresh' && action !== 'more') {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let pageSize, timestamp;
  try {
    pageSize = Number(req.body.pageSize) || 10;
    timestamp = req.body.timestamp || 0;
  }
  catch (err) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  Post.find({segmentType, segmentId, createTime: action === 'refresh' ? {$gt: timestamp} : {$lt: timestamp}})
    .select('_id createrId segmentType segmentId content images audio commentNum likeNum createTime')
    .limit(pageSize)
    .sort({createTime: -1})
    .populate({path: 'createrId', select: '_id nickname avatar identity'})
    .then(data => {
      res.json({
        code: 0,
        message: 'ok',
        result: {
          action,
          timestamp,
          pageSize: data.length,
          data
        }
      })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/comment', function (res, req) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {postId, content} = req.body;
  if (!postId || !content) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  activityService.commentPost({
    createrId: req.user._id,
    postId,
    content
  })
    .then(data => {
      if (data) {
        res.json({
          code: 0,
          message: 'ok',
          result: data._id
        })
      }
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/commentList', function (req, res) {
  const {postId, action} = req.body;
  if (!postId || !action) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  if (action !== 'refresh' && action !== 'more') {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let pageSize, timestamp;
  try {
    pageSize = Number(req.body.pageSize) || 10;
    timestamp = req.body.timestamp || 0;
  }
  catch (err) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  Comment.find({postId, createTime: action === 'refresh' ? {$gt: timestamp} : {$lt: timestamp}})
    .select('_id createrId postId content createTime')
    .limit(pageSize)
    .exec()
    .then(data => {
      res.json({
        code: 0,
        message: 'ok',
        result: {
          postId,
          action,
          pageSize: data.length,
          data
        }
      })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

module.exports = router;