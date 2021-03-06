/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const Work = require('../models/work');
const User = require('../models/user');
const Event = require('../models/event');

router.post('/event', function (req, res) {
  /*
  Event.find
   */
  let page, pageSize;
  try {
    page = Number(req.body.page) || 0;
    pageSize = Number(req.body.pageSize) || 10;
  }
  catch (err) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let countPromise = Event.count();
  let findPromise = Event.aggregate([
    {$sort: {createTime: -1}},
    {$skip: page * pageSize},
    {$limit: pageSize},
    {
      $lookup: {
        from: User.collection.collectionName,
        localField: 'createrId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user',
    },
    {
      $lookup: {
        from: Activity.collection.collectionName,
        localField: 'activityId',
        foreignField: '_id',
        as: 'activity'
      }
    },
    {
      $unwind: '$activity'
    },
    {
      $lookup: {
        from: Work.collection.collectionName,
        localField: 'workId',
        foreignField: '_id',
        as: 'work'
      }
    },
    {
      $unwind: {
        path: '$work',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $project: {
        eventType: 1,
        commentNum: 1,
        likeNum: 1,
        createTime: 1,
        user: {
          _id: 1,
          nickname: 1,
          identity: 1,
          avatar: 1,
        },
        activity: {
          _id: 1,
          title: 1,
        },
        committeeId: '$activity.committee.userId',
        segmentId: 1,
        segmentTitle: 1,
        segmentText: 1,
        audio: 1,
        video: 1,
        images: 1,
        workId: 1,
        workTitle: '$work.title',
        postId: 1,
        location: 1,
        performer: 1,
      }
    },
    {
      $unwind: {
        path: '$committeeId',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $lookup: {
        from: User.collection.collectionName,
        localField: 'committeeId',
        foreignField: '_id',
        as: 'committeeUser'
      }
    },
    {
      $unwind: {
        path: '$committeeUser',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $project: {
        _id: 1,
        eventType: 1,
        commentNum: 1,
        likeNum: 1,
        createTime: 1,
        user: 1,
        activity: 1,
        committeeUser: {
          uid: '$committeeUser._id',
          avatar: '$committeeUser.avatar',
          identity: '$committeeUser.identity',
        },
        segmentId: 1,
        segmentTitle: 1,
        segmentText: 1,
        audio: 1,
        video: 1,
        images: 1,
        workId: 1,
        workTitle: 1,
        postId: 1,
        location: 1,
        performer: 1,
      }
    },
    {
      $group: {
        _id: '$_id',
        eventType: {$last: '$eventType'},
        commentNum: {$last: '$commentNum'},
        likeNum: {$last: '$likeNum'},
        createTime: {$last: '$createTime'},
        user: {$last: '$user'},
        activity: {$last: '$activity'},
        committeeUsers: {$push: '$committeeUser'},
        segmentId: {$last: '$segmentId'},
        segmentTitle: {$last: '$segmentTitle'},
        segmentText: {$last: '$segmentText'},
        audio: {$last: '$audio'},
        video: {$last: '$video'},
        images: {$last: '$images'},
        workId: {$last: '$workId'},
        workTitle: {$last: '$workTitle'},
        postId: {$last: '$postId'},
        location: {$last: '$location'},
        performer: {$last: '$performer'},
      },
    },
    {
      $project: {
        _id: 0,
        eventId: '$_id',
        type: '$eventType',
        commentNum: 1,
        likeNum: 1,
        date: '$createTime',
        user: {
          id: '$user._id',
          avatar: 1,
          identity: 1,
          nickname: 1,
        },
        content: {
          activityId: '$activity._id',
          activityTitle: '$activity.title',
          audio: '$audio',
          committeeUsers: '$committeeUsers',
          images: '$images',
          segmentId: '$segmentId',
          segmentTitle: '$segmentTitle',
          text: '$segmentText',
          video: '$video',
          workId: '$workId',
          workTitle: '$workTitle',
          postId: '$postId',
          location: {
            address: '$address',
            lat: '$lat',
            lng: '$lng',
          },
          performer: 1,
        },
      }
    },
    {$sort: {date: -1}},
  ]);

  Promise.all([
    findPromise.exec(),
    countPromise.exec()
  ])
    .then(dataArr => {
      let data = dataArr[0];
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].content.committeeUsers.length; j++) {
          if (!data[i].content.committeeUsers[j].uid) {
            data[i].content.committeeUsers.splice(j, 1);
            break;
          }
        }
      }
      res.json({
        'code': 0,
        'message': 'ok',
        'result': {
          total: dataArr[1],
          page: page,
          pageSize: data.length,
          data: data
        }
      })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

router.post('/comment', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {eventId, content} = req.body;

  if (!eventId || !content) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  let event = new Event({
    createrId: req.user._id,
    eventId: eventId,
    content: content,
  });

  event.save()
    .then(data => {
      res.json({
        code: 0,
        message: 'ok',
        eventCommentId: data._id,
      })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })
});

module.exports = router;
