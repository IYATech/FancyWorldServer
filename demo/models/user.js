const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
  title:String,
  name:String
});

// Export Mongoose model
module.exports = mongoose.model('user', userSchema);