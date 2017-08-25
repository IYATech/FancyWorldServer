/**
 * Created by jialing on 2017/8/19.
 */

const express = require('express');
const router = express.Router();
const activityService = require('../service/activity');
const userService = require('../service/user');
const Activity = require('../models/activity');
const User = require('../models/user');
const UserMsg = require('../models/userMsg');
const ChatMsg = require('../models/chatMsg');
const EnrollInfo = require('../models/enrollInfo');

router.post('/activity', function (req, res) {

});

router.post('/user', function (req, res) {
  let keyword = req.body.keyword || '';

  let page, pageSize;
  try {
    page = Number(req.body.page) || 0;
    pageSize = Number(req.body.pageSize) || 10;
  }
  catch (err) {
    res.json(ErrMsg.PARAMS);
    return;
  }

  Promise.all([
    User.find({nickname: {$regex: keyword, $options: 'i'}})
      .select('_id nickname avatar identity')
      .skip(page * pageSize)
      .limit(pageSize)
      .exec(),
    User.count({nickname: {$regex: keyword, $options: 'i'}}).exec()
  ])
    .then(data => {
      res.json({
        code: 0,
        message: 'ok',
        result: {
          total: data[1],
          page,
          pageSize: data[0].length,
          data: data[0]
        }
      })
    })
    .catch(err => {
      res.json(ErrMsg.DB);
      console.log(err.message);
    })

});

router.post('/work', function (req, res) {

});

module.exports = router;