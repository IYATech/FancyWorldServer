/**
 * Created by jialing on 2017/7/28.
 */

const http = require('http');

const app = require('./demo')

// 打印异常日志
process.on('uncaughtException', error => {
  console.log(error);
});

// 启动server
http.createServer(app).listen('3000', () => {
  console.log('Express server listening on port: %s', '3000');
});