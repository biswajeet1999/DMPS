const mongoose = require('mongoose');

// it will store notices
// notice no will uniquely identify each notice. used while deleting notice

const noticeSchema = new mongoose.Schema({
  noticeno: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1
  },
  notice: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1
  },
  date: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    maxlength: 10
  }
});

const NoticeModel = mongoose.model('Notices', noticeSchema);


module.exports = { NoticeModel };