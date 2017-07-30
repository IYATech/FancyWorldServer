/**
 * Created by jialing on 2017/7/29.
 */

/*
  define error code
 */
global.ErrMsg = {
  PARAMS: {
    code: -1001,
    message: '参数错误'
  },
  DB:{
    code:-1002,
    message:'数据操作异常'
  }
};

module.exports = global;