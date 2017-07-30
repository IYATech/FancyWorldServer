/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const router = express.Router();

router.post('/new', function (req, res, next) {
  res.json({
    'code': 0,
    'message': 'ok',
    'result': {
      eventNum: Math.round(Math.random() * 10),
      msgNum: Math.round(Math.random() * 10)
    }
  })

});

module.exports = router;
