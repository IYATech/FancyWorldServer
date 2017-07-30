/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const router = express.Router();

const Event = require('../models/event');

router.post('/event', function (req, res, next) {

  const {page} = req.body;

  Event.findOne({})
    .then(events => {
      if (events) {
        const identifys = events.identify;
        const nicknames = events.nickname;
        const uids = events.uid;
        const avatars = events.avatar;

        let committeeUsers = uids.map(function (id, i) {
          return {
            id: id,
            identify: identifys[i].slice(),
            avatar: avatars[i],
            nickname: nicknames[i]
          }
        });

        const data = [
          {
            eventID: events._id,
            type: 'NewsTheme',
            date: new Date(events.date * 1000).toLocaleDateString(),
            likeNum: events.likeNum,
            commentNum: events.commentNum,
            user: {
              id: events.thisUid,
              nickname: events.thisNickname,
              identify: events.thisIdentify.slice(),
              avatar: events.thisAvatar
            },
            content: {
              activityID: events.activityId,
              activityTitle: events.activityTitle,

              committeeUsers: committeeUsers,
              text: events.text,
              mediaType: 'photo',
              images: events.images,
            }
          },
          {
            eventID: events._id,
            type: 'NewsTopic',
            date: new Date(events.date * 1000).toLocaleDateString(),
            likeNum: events.likeNum,
            commentNum: events.commentNum,
            user: {
              id: events.thisUid,
              nickname: events.thisNickname,
              identify: events.thisIdentify.slice(),
              avatar: events.thisAvatar
            },
            content: {
              activityID: events.activityId,
              activityTitle: events.activityTitle,
              segmentID: events.segmentId,
              segmentTitle: events.segmentTitle,
              committeeUsers: committeeUsers,
              text: events.text,
              mediaType: 'video',
              video: events.video,
              thumbnail: events.thumbnail,
            }
          },
          {
            eventID: events._id,
            type: 'NewsSignIn',
            date: new Date(events.date * 1000).toLocaleDateString(),
            likeNum: events.likeNum,
            commentNum: events.commentNum,
            user: {
              id: events.thisUid,
              nickname: events.thisNickname,
              identify: events.thisIdentify.slice(),
              avatar: events.thisAvatar
            },
            content: {
              activityID: events.activityId,
              activityTitle: events.activityTitle,
              segmentID: events.segmentId,
              segmentTitle: events.segmentTitle,
              committeeUsers: committeeUsers,
              text: events.text,
              mediaType: 'audio',
              audio: events.audio,
              location: {
                lat: events.lat,
                lng: events.lng,
                address: events.address
              }
            }
          }
        ];

        res.json({
          'code': 0,
          'message': 'ok',
          'result': {
            total: data.length * 10,  //模拟多条数据
            page: page,
            pageSize: data.length,
            data: data
          }
        })
      }
      else {
        res.json({
          'code': 0,
          'message': 'ok',
          'result': {
            total: 0,
            page: page,
            pageSize: 0,
            data: []
          }
        })
      }
    })
    .catch(err => {
      if (err) {
        res.json({'code': -1, 'message': err.message})
      }
    });
});

module.exports = router;
