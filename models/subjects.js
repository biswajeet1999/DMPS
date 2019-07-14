const mongoose = require('mongoose')

// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb+srv://dmps:deepak@2019@cluster0-hshz5.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser:true });

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
//   "_id" : ObjectId("5d1cbfbb84b02125a4368fed"),
//   "class" : "lkg",
//   "subjects" : [ 
//       {
//           "_id" : ObjectId("5d1cbfbb84b02125a4368ff3"),
//           "name" : "mathstep",
//           "totalexams" : 6,
//           "maxmark" : 100
//       }, 
//       {
//           "_id" : ObjectId("5d1cbfbb84b02125a4368ff2"),
//           "name" : "english",
//           "totalexams" : 6,
//           "maxmark" : 100
//       }, 
//       {
//           "_id" : ObjectId("5d1cbfbb84b02125a4368ff1"),
//           "name" : "mil",
//           "totalexams" : 6,
//           "maxmark" : 100
//       }, 
//       {
//           "_id" : ObjectId("5d1cbfbb84b02125a4368ff0"),
//           "name" : "story",
//           "totalexams" : 6,
//           "maxmark" : 50
//       }, 
//       {
//           "_id" : ObjectId("5d1cbfbb84b02125a4368fef"),
//           "name" : "drawing",
//           "totalexams" : 6,
//           "maxmark" : 50
//       }, 
//       {
//           "_id" : ObjectId("5d1cbfbb84b02125a4368fee"),
//           "name" : "hindi",
//           "totalexams" : 6,
//           "maxmark" : 50
//       }
//   ],
//   "__v" : 0
// });

// subject.save().then((obj)=>{}, (err)=>{console.log(err)})

module.exports = { SubjectModel };