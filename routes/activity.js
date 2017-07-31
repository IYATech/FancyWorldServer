/**
 * Created by jialing on 2017/7/31.
 */

const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const ActivityTheme = require('../models/activity');

router.post('/publishTheme', function (req, res, next) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {
    title, tag, committeeUserId, sponsor, undertaker,
    description, images, audio, thumbnail, video,
    customEnrollInfo, endTime, invisibleUserId, visibleUserId
  } = req.body;

  if (!title || !tag || !committeeUserId || !sponsor || !undertaker ||
    !description || !customEnrollInfo || !endTime || !invisibleUserId || !visibleUserId) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let theme = new ActivityTheme({
    createrId: req.user._id,
    title,
    description,
    images,
    audio,
    thumbnail,
    video,
    sponsor,
    undertaker,
    customEnrollInfo,
    invisibleUserId,
    visibleUserId,
    enrollInfoId: [],
  });

  let activity = new Activity({
    createrId: req.user._id,
    title,
    tag,
    endTime,
    status: 'save',
    committeeId: committeeUserId,
    segment: []
  });

  Promise.all([
    theme.save(),
    activity.save()
  ])
    .then(data => {
      let t = data[0];
      let a = data[1];

      t.activityId = a._id;
      a.segment.push({
        segmentType: 'theme',
        segmentId: t._id
      });

      return Promise.all([
        t.save(),
        a.save()
      ])
    })
    .then(data => {
      //todo 给组委会成员发消息


      res.json({
        code: 0,
        message: 'ok',
        result: {
          segmentId: data[0]._id,
          activityId: data[1]._id
        }
      })
    })
    .catch(err => {
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      })
    });
});

module.exports = router;