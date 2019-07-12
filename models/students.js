const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/dmps', { useNewUrlParser:true });

// it will store info about all students
// students will be removed by date of passout
// we can add and remove particular student
// password will be generated using dateofjoin + phone[-3:]
// id will generate the unique id of student name + phone[-3:]
// student will use id and password to login

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  studentid: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true
  },
  dateOfJoin: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 4
  },
  dateOfPassout: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 4
  },
  father: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  mother: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  address: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    minlength: 10
  },
  adhar: {
    type: String,
    required: true,
    trim: true,
    minlength: 12,
    maxlength: 12,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const StudentModel = mongoose.model('Students', studentSchema);

// let st = new StudentModel({
//   name: 'Biswajeet',
//   id: '2019890',
//   dateOfJoin: '2019',
//   dateOfPassout: '2021',
//   father: 'abc',
//   mother: 'pqr',
//   address: 'abc',
//   phone: '1234567890',
//   password: '2019890'
// });
// st.save().then((obj)=>{
//   console.log(obj);
// }, (err)=>{
//   console.log(err);
// })

module.exports = { StudentModel };