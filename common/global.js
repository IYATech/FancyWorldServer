/**
 * Created by jialing on 2017/7/29.
 */

/*
  define error code
 */
global.ErrMsg = {
  PARAMS: {
    code: -1001,
    message: 'params error'
  },
  DB: {
    code: -1002,
    message: 'database error'
  },
  Token: {
    code: -1003,
    message: 'no login'
  }
};

/*
  define user identity weight
 */
global.IdentityWeight = {
  'patriarch':1,
  'teacher':2,
  'expert':3,
  'leader':3
};

module.exports = global;