/**
 * Created by jialing on 2017/7/28.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const UserMsg = require('../models/userMsg');

router.post('/new', function (req, res, next) {
  if(!req.user){
    res.json(ErrMsg.Token);
    return;
  }

  UserMsg.findOne({userId:req.user._id}).exec()
    .then(data=>{
      if(data){
        res.json({
          code:0,
          message:'ok',
          result:data
        })
      }
    })
    .catch(err=>{
      res.json({
        code:ErrMsg.DB.code,
        message:err.message
      })
    });
});

module.exports = router;
