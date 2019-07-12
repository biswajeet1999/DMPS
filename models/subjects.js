const mongoose = require('mongoose')

// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/dmps', { useNewUrlParser:true });

// max mark store max mark for each subject of annual exam
// max mark for annual and half-yearly exams are same
// max mark for monthly exam is annual/2

const subjectSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 3, 
  },
  subjects: [{
    name:{
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    totalexams: {
      type: Number,
      required: true,
      min: 1,
      max: 6
    },
    maxmark: {
      type: Number,
      required: true,
      min: 12.5,
      max: 100
    }
  }]
});

const SubjectModel = mongoose.model('subjects', subjectSchema);

// let subject = new SubjectModel({
//   "class" : "7",
//     "subjects" : [ 
//         {
//             "name" : "mathstep",
//             "totalexams" : 6,
//             "maxmark" : 100
//         }, 
//         {
//             "name" : "english",
//             "totalexams" : 6,
//             "maxmark" : 100
//         }, 
//         {
//             "name" : "mil",
//             "totalexams" : 6,
//             "maxmark" : 100
//         }, 
//         {
//             "name" : "history",
//             "totalexams" : 6,
//             "maxmark" : 50
//         }, 
//         {
//             "name" : "geography",
//             "totalexams" : 6,
//             "maxmark" : 50
//         }, 
//         {
//             "name" : "sanskrit",
//             "totalexams" : 6,
//             "maxmark" : 50
//         }, 
//         {
//             "name" : "story",
//             "totalexams" : 6,
//             "maxmark" : 50
//         }, 
//         {
//             "name" : "drawing",
//             "totalexams" : 6,
//             "maxmark" : 50
//         }, 
//         {
//             "name" : "science",
//             "totalexams" : 6,
//             "maxmark" : 100
//         }, 
//         {
//             "name" : "matho",
//             "totalexams" : 6,
//             "maxmark" : 100
//         }, 
//         {
//             "name" : "hindi",
//             "totalexams" : 6,
//             "maxmark" : 50
//         }, 
//         {
//             "name" : "gk",
//             "totalexams" : 6,
//             "maxmark" : 100
//         }
//     ]
// });

// subject.save().then((obj)=>{}, (err)=>{console.log(err)})

module.exports = { SubjectModel };