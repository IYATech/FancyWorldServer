/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Event = require('../models/event');

router.post('/event', function (req, res, next) {
  /* GET users listing. */

  let page = req.body.page;

  Event.findOne({}, function (err, events) {
    if (err) {
      res.json({'code': -1, 'message': err.message})
    }

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
          likeNum: events.likenum,
          commentNum: events.commentnum,
          user: {
            id: events.thisuid,
            nickname: events.thisnickname,
            identify: events.thisidentify.slice(),
            avatar: events.thisavatar
          },
          content: {
            activityID: events.activityid,
            activityTitle: events.activitytitle,

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
          likeNum: events.likenum,
          commentNum: events.commentnum,
          user: {
            id: events.thisuid,
            nickname: events.thisnickname,
            identify: events.thisidentify.slice(),
            avatar: events.thisavatar
          },
          content: {
            activityID: events.activityid,
            activityTitle: events.activitytitle,
            segmentID: events.segmentid,
            segmentTitle: events.segmenttitle,
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
          likeNum: events.likenum,
          commentNum: events.commentnum,
          user: {
            id: events.thisuid,
            nickname: events.thisnickname,
            identify: events.thisidentify.slice(),
            avatar: events.thisavatar
          },
          content: {
            activityID: events.activityid,
            activityTitle: events.activitytitle,
            segmentID: events.segmentid,
            segmentTitle: events.segmenttitle,
            committeeUsers: committeeUsers,
            text: events.text,
            mediaType: 'audio',
            audio: events.audio,
            location:{
              lat: events.lat,
              lng: events.lng,
              address: events.address
            }
          }
        }
      ]

      res.json({
        'code': 0,
        'message': 'ok',
        'result': {
          total: data.length * 10,
          page: page,
          pageSize: data.length,
          data: data
        }
      })
    }
    else{
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
  });
});

module.exports = router;
