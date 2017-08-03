/**
 * Created by jialing on 2017/8/1.
 */

const express = require('express');
const router = express.Router();
const config = require('../common/config');
const activityService = require('../service/activity');
const Activity = require('../models/activity');
const ActivitySignIn = require('../models/activitySignIn');

router.post('/add', function (req, res) {
  if (!req.user) {
    res.json(ErrMsg.Token);
    return;
  }

  const {
    activityId, title, description, images, video,
    audio, lat, lng, address
  } = req.body;

  if (!activityId || !title || !description || !address || !lat || !lng) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  Activity.findOne({_id: activityId, createrId: req.user._id}).exec()
    .then(data => {
      if (!data) {
        res.json({
          code: -1,
          message: '活动不存在'
        });
      }
      else {
        let signIn = new ActivitySignIn({
          createrId: req.user._id,
          activityId,
          title,
          description,
          images,
          audio,
          video,
          address,
          lat,
          lng,
        });
        let segmentId;
        signIn.save()
          .then(p => {
            data.segment.push({
              segmentId: p._id,
              segmentType: 'signIn'
            });
            segmentId = p._id;
            return data.save();
          })
          .then(() => {
            res.json({
              code: 0,
              message: 'ok',
              result: {
                activityId,
                segmentId
              }
            })
          })
          .catch(err => {
            res.json({
              code: ErrMsg.DB.code,
              message: err.message
            })
          })
      }
    })
    .catch(err => {
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      })
    })
});

router.post('/get', function (req, res) {
  const {activityId, segmentId} = req.body;

  if (!activityId || !segmentId) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  activityService.hasPermission(activityId, req.user && req.user._id)
    .then(result => {
      if (!result) {
        res.json({
          code: -1,
          message: '活动不存在或无权查看'
        });
        return;
      }

      ActivitySignIn.findById(segmentId)
        .select('_id createrId activityId title description images audio video createTime postNum lat lng address')
        .exec()
        .then(data => {
          if(data){
            //todo 二维码内容生成地址
            data._doc.qrcode = config.QRCode.url + 'fancy world';
          }
          res.json({
            code: 0,
            message: 'ok',
            result: data
          });
        })
        .catch(err => {
          res.json({
            code: ErrMsg.DB.code,
            message: err.message
          });
        })
    })
    .catch(err => {
      res.json({
        code: ErrMsg.DB.code,
        message: err.message
      });
    })
});

module.exports = router;