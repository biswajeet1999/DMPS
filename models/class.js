const mongoose = require('mongoose');

const {StudentModel} = require('./students');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/dmps', { useNewUrlParser:true });

// it will store the class details along with section
// there is section array which contains individual section names 
// and for each section having student array.
// student array contains student name, rollno, id attribute of student present in Students collection and marks
// id attribute is used to uniquely identify student from students collection

// before storing student details first class collection should be created with sections then student should be saved
const classSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 4,
    trim: true
  },
  class: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 3
  },
  section: [{
    sectionname: {
      type: String,
      required: true,
      unique: true,
      minlength: 1,
      maxlength: 1,
      trim: true
    },
    students: [{
      rollno: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
      },
      id: {
        type: String,
        required: true,
        unique: true
      },
    }]
  }]
});

const classModel = mongoose.model('Class', classSchema);

const name = 'Biswajeet'
const rollno = 1
const id = "2019890"
const year = '2019'
const sec = 'A'
const classs = '8'

StudentModel.findOne({id, name}).then((obj)=>{
  if (!obj) {
    console.log('Student not found');
  } else{
    classModel.findOne({year, class: classs, 'section.sectionname': sec}).then((obj) => {
      if(!obj){
        return console.log('class not found');
      }
      for(let i=0; i< obj.section.length; i++) {
        if(obj.section[i].sectionname === sec) {
          obj.section[i].students.push({name, rollno, id});
          break;
        }
      }
      classModel(obj).save().then((obj)=>{console.log('saved'), (err)=> {err}})

    }, (err) => {
      console.log(err);
    });
  }
}, (err) => {
  console.log(err);
});



// const cls = new classModel({
//   year: '2019',
//   class: '8',
//   section:[
//     {sectionname: 'A'},
//     {sectionname: 'B'}
//   ]  
// });


// cls.save().then((obj)=>{
//   console.log(obj)
// }, (err) => {
//   console.log(err)
// })


// section: [{
//   sectionname: 'A',
//   students: [{
//     name: 'biswajeet padhi',
//     rollno: '1',
//     id: '2019890',
//     marks: {
//       monthly1: {
//         marks: [{
//           subject: 'math',
//           mark: 80
//         }],
//         totalmark: 80,
//         percentage: 70
//       }
//     }
//   }]
// }]

module.exports = { classModel }