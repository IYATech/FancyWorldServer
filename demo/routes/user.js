/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const router = express.Router();


/* GET users listing. */
router.post('/login', function (req, res, next) {

  res.json({
    'code': 0,
    'message': 'ok',
    'result': 123
  })

});

module.exports = router;
