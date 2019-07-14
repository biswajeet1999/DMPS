const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://dmps:<password>@cluster0-hshz5.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser:true });

module.exports = {mongoose};


// local database path
// 'mongodb://localhost:27017/dmps'