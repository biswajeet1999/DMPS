const mongoose = require('mongoose');

// image path will store the url to uploaded image .
// image will be stored in upload folder
const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1
  },
  contact: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 10
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1
  },
  imagePath: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1
  }
});

const TeacherModel = mongoose.model('Teachers', teacherSchema);


module.exports = { TeacherModel };