/**
 * Created by jialing on 2017/7/29.
 */

/*
  define error code
 */
global.ErrMsg = {
  PARAMS: {
    code: -1001,
    message: '请求参数错误'
  },
  DB: {
    code: -1002,
    message: '服务器异常'
  },
  Token: {
    code: -1003,
    message: '未登录或登录过期'
  },
  Identity: {
    code: -1004,
    message: '认证身份权限不足'
  },
  Enroll: {
    code: -1005,
    message: '未报名参与活动'
  },
  NotFound: {
    code: -1006,
    message: '未查询到信息'
  },
  Permission: {
    code: -1007,
    message: '未授权的操作'
  },
};

/*
  define user identity weight
 */
global.IdentityWeight = {
  'patriarch': 1,
  'teacher': 2,
  'expert': 3,
  'leader': 3
};

global.EventType = {
  'NewsTheme': 'NewsTheme',
  'NewsTopic': 'NewsTopic',
  'NewsSignIn': 'NewsSignIn',
  'NewsNotice': 'NewsNotice',
  'NewsUpload': 'NewsUpload',
  'NewsElect': 'NewsElect',
  'NewsCourse': 'NewsCourse',
  'NewsEnroll': 'NewsEnroll',
  'NewsWorks': 'NewsWorks',
  'NewsModify': 'NewsModify',
  'NewsPost': 'NewsPost',
};

/*
  define segmentType and collection name
 */

const models = {
  'theme': require('../models/activity'),
  'topic': require('../models/activityTopic'),
  'signIn': require('../models/activitySignIn'),
  'notice': require('../models/activityNotice'),
  'uploading': require('../models/activityUploading'),
  'elect': require('../models/activityElect'),
  'course': require('../models/activityCourse')
};

global.GetModel = function (name) {
  return models[name];
};

module.exports = global;