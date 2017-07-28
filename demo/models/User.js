/**
 * Created by tianyu on 2017/7/28.
 */

var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/runoob';

function findUser(id){
  return new Promise(function (resolve,rejet) {
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '123456',
      database : 'test'
    });

    connection.connect();

    connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
      if (error)
        rejet(err)
      else{
        resolve(results)
      }
      // console.log('The solution is: ', results[0].solution);
    });
  })
}

UserService = {findUser}

module.exports = UserService
