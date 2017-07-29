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


});

module.exports = router;
