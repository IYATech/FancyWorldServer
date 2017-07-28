/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = require('../models/user');

mongoose.connect('mongodb://123.56.182.49:27017/test');

/* GET users listing. */
router.post('/login', function (req, res, next) {

  // Find all movies and return json response
  // User.find().lean().exec((err, users) => res.json(
  //   // Iterate through each movie
  //   {
  //     'code': 0,
  //     'message': 'ok',
  //     'result': users
  //   }
  // ));

  new Promise(function (resolve, reject) {
    User.findOne({ name: 'test' }, function (err, users) {
      if(err)
        reject(err)

      if(users)
      {
        // User.findOne({ title: 'test' }, function (err, users) {
        //   if(err)
        //     reject(err)
        //
        //   if(users){
        //     reject(users)
        //   }
        // });
        resolve(users)
      }
    });
  })
    .then(users => {
      res.json(
        // Iterate through each movie
        {
          'code': 0,
          'message': 'ok',
          result:users
        }
      )
    })
    .catch(err => {
      res.json(
        // Iterate through each movie
        {
          'code': 0,
          'message': err.message
        }
      )
    })

});

module.exports = router;
