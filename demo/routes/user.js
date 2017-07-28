/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const router = express.Router();

const UserService = require('../models/User');

/* GET users listing. */
router.post('/login', function (req, res, next) {

  UserService.findUser(12)
    .then(result=>{
      res.json({
        'code': 0,
        'message': 'ok',
        'result': result
      })
    })
    .catch(error=>{

    })



});

module.exports = router;
