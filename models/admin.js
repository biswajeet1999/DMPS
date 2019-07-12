const mongoose = require('mongoose');

// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/dmps', { useNewUrlParser:true });

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  adminid: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
});

const AdminModel = mongoose.model('admin', adminSchema);

// new AdminModel({name: 'Jeet', id: 'jeet1999', password: '12345'}).save((admin) => {}, (err) => {console.log(err)});

module.exports = { AdminModel };