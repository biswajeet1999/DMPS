const express = require("express");
const multer = require("multer");
const hbs = require("hbs");
const path = require("path");
const passport = require("passport");
const Strategy = require('passport-local').Strategy;
const cookieSession = require('cookie-session');
const fs = require('fs');
const json2csv = require('json2csv').parse;

// local modules
const {mongoose} = require('./db/mongoose');
const {TeacherModel} = require('./models/teachers');
const {NoticeModel} = require('./models/notice');
const {StudentModel} = require("./models/students");
const {ClassModel} = require('./models/class');
const {SubjectModel} = require('./models/subjects');
const {MarkModel} = require('./models/marks');
const {AdminModel} = require('./models/admin');

const app = express();

// setup static routs
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, "/public/css")));
app.use(express.static(path.join(__dirname, "/public/images")));
app.use(express.static(path.join(__dirname, '/public/upload')));
app.use(express.static(path.join(__dirname, '/public/downloads')));

// hbs helpers
hbs.registerHelper('getIndex', (index) => index+1);
hbs.registerHelper('getMonthlyMark', (mark) => mark/4);
hbs.registerHelper('getAnnualTotalMark', (marks) => {
  let total = 0;
  for (let i=0; i < marks.subjects.length; i++) {
    total += marks.subjects[i].maxmark;
  }
  return total;
});
hbs.registerHelper('getMonthlyTotalMark', (marks) => {
  let total = 0;
  for (let i=0; i < marks.subjects.length; i++) {
    total += marks.subjects[i].maxmark / 4;
  }
  return total;
});

// setup multer upload path
const storage = multer.diskStorage({
  destination: './public/upload/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage
});

// =================================================================================================================================
// ========================================== P A S S P O R T   A N D   C O O K I E ================================================
// =================================================================================================================================


// cookie will valied for 1hr (in milli second)
// key is used to encrypt cession id
app.use(cookieSession({ maxAge: 60 * 60 * 1000, keys: ['dmps'] }));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// set student/admin id to browser cookie
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// access the browswer cookie
// user is set to req object after they verified
passport.deserializeUser(function(id, done) {
  StudentModel.findById(id).then((user) => {
    // student login
    if (user) {
      done(null, user);
    } else {
      // admin login
      AdminModel.findById(id).then((user) => {
        done(null, user)
      });
    }
  })
});

// passport student authantication
passport.use('Student', new Strategy({
  usernameField: 'id',
  passwordField: 'password'
}, function(username, password, done) {
        StudentModel.findOne({ studentid: username, password }, function (err, user) {
          if (err) { return done(err); }
          if (!user) {
            return done(null, false, { message: 'Incorrect username or password' });
          } else {
            return done(null, user);
          }
        });
    })
);

// passport admin authantication
passport.use('Admin', new Strategy({
  usernameField: 'id',
  passwordField: 'password'
}, function(username, password, done) {
        AdminModel.findOne({ adminid: username, password }, function (err, user) {
          if (err) { return done(err); }
          if (!user) {
            
            return done(null, false, { message: 'Incorrect username or password' });
          } else {
            return done(null, user);
          }
        });
    })
);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
 
  // if the user is invallid redirect to login page
  // if he/she is student redirect to student login page else admin login page
  if (req.route.path.startsWith('/student')) {
    // student login
    res.redirect('/student/login');
  } else {
    // admin login
    res.redirect('/admin/login');
  }
}

// =================================================================================================================================
// ================================================ G E N E R A L   R O U T S ======================================================
// =================================================================================================================================

app.get('/', (req, res) => {
  res.render('home.hbs');
});

app.get('/teacher', (req, res) => {
  TeacherModel.find({}).then((teachers) => {
    if (teachers.length === 0) {
      res.status(200).render('teacher.hbs', {msg: "No Teacher found:("});
    } else {
      res.status(200).render('teacher.hbs', {teachers});
    }
  }, (err) => {
    res.status(400).render('teacher.hbs', {msg: "Somthing went wrong..."});
  });
});

app.get('/notice', (req, res) => {
  NoticeModel.find({}).then((notices) => {
    if (notices.length === 0) {
      res.status(200).render('notice.hbs', {msg: "No Notice"});
    } else {
      res.status(200).render('notice.hbs', {notices});
    }
  }, (err) => {
    res.status(400).render('notice.hbs', {msg: "Somthing went wrong..."});
  });
});

app.get('/student/login', (req, res) => {
  res.render('studentlogin.hbs');
});

app.post('/student/signin', upload.single(), passport.authenticate('Student', {
  successRedirect: '/student/home',
  failureRedirect: '/student/login',
}));

app.get('/admin/login', (req, res) => {
  res.render('adminlogin.hbs');
});

app.post('/admin/signin', upload.single(), passport.authenticate('Admin', {
  successRedirect: '/admin/home',
  failureRedirect: '/admin/login',
}));

app.get('/apply', (req, res) => {
  res.render('applyform.hbs');
});

// =================================================================================================================================
// ================================================ S T U D E N T   P E N A L ======================================================
// =================================================================================================================================


// student routs after login
app.get('/student/home', ensureAuthenticated, (req, res) => {
  res.render('studenthome.hbs', {name: req.user.name});
});

app.get('/student/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  res.redirect('/student/login');
});

app.get('/student/notice', ensureAuthenticated, (req, res) => {
  NoticeModel.find({}).then((notices) => {
    if (notices.length === 0) {
      res.status(200).render('studentnotice.hbs', {name: req.user.name,msg: "No Notice"});
    } else {
      res.status(200).render('studentnotice.hbs', {name: req.user.name, notices});
    }
  }, (err) => {
    res.status(400).render('studentnotice.hbs', {name: req.user.name, msg: "Somthing went wrong..."});
  });
});

app.get('/student/teacher', ensureAuthenticated, (req, res) => {
  TeacherModel.find({}).then((teachers) => {
    if (teachers.length === 0) {
      res.status(200).render('studentteacher.hbs', {name: req.user.name, msg: "No Teacher found:("});
    } else {
      res.status(200).render('studentteacher.hbs', {name: req.user.name, teachers});
    }
  }, (err) => {
    res.status(400).render('studentteacher.hbs', {name: req.user.name, msg: "Somthing went wrong..."});
  });
});

app.get('/student/marks', ensureAuthenticated, (req, res) => {
  let {studentid} = req.user;
  //find student marks
  MarkModel.findOne({studentid}).then((marks) => {
    if (!marks) {
      return res.render('studentmark.hbs', {name: req.user.name, msg: 'Student not exists in any class'});
    } else {
      // find subject list
      SubjectModel.findOne({class: marks.class}).then((subjects) => {      
        // find class in which the student exists
        ClassModel.findOne({class: subjects.class, 'section.students.studentid': marks.studentid}).then((cls) => {
          // find student rollno
          for (let i=0; i < cls.section.length; i++) {
            for (let j=0; j < cls.section[i].students.length; j++) {
              if (cls.section[i].students[j].studentid === studentid) {
                return res.render('studentmark.hbs', {name: req.user.name, marks, subjects, section: cls.section[i].sectionname, rollno: cls.section[i].students[j].rollno});
              }
            }
          }    
        }, (err) => {
          res.render('studentmark.hbs', {name: req.user.name, msg: 'unable to find student rollno'});
        });
      });
    }
  }).catch((err) => {
    res.render('studentmark.hbs', {name: req.user.name, msg: 'unable to fetch marks.'});
  });
});

// =================================================================================================================================
// ================================================ A D M I N   P E N A L ==========================================================
// =================================================================================================================================


// admin routs after login
app.get('/admin/home', ensureAuthenticated, (req, res) => {
  res.render('adminhome.hbs', {name: req.user.name});
});

app.get('/admin/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  res.redirect('/admin/login');
});

// ----------------------------- Student Section ------------------------------------
app.get('/admin/student', ensureAuthenticated, (req, res) => {
  res.render('adminstudent.hbs', {name: req.user.name});
});

app.get('/admin/student/add', ensureAuthenticated, (req, res) => {
  res.render('adminstudentadd.hbs', {name: req.user.name});
});

app.post('/admin/student/store', ensureAuthenticated, upload.single(), (req, res) => {
  let name = req.body.name;
  let father = req.body.father;
  let mother = req.body.mother;
  let dateOfJoin = req.body.doj;
  let dateOfPassout = req.body.dop;
  let address = req.body.address;
  let adhar = req.body.adhar;
  let phone = req.body.phone;
  let studentid = name + phone.slice(phone.length-3, phone.length);
  let password = dateOfJoin + phone.slice(phone.length-3, phone.length);
  let dob = req.body.dob;
  let dateOfAdmission = req.body.doa;
  let gender = req.body.gender;

  let student = {name, father, mother, dateOfJoin, dob, dateOfAdmission, gender, dateOfPassout, address, phone, adhar, studentid, password};
  StudentModel.findOne(student).then((stud) => {
    if (stud) {
      return res.render("adminstudentadd.hbs", {name: req.user.name, msg:'Duplicate Student'});
    } else {
      new StudentModel(student).save().then((student) => {
        res.render("adminstudentadd.hbs", {name: req.user.name, account:{studentid, password}});
      }, (err) => {
        res.render("adminstudentadd.hbs", {name: req.user.name, msg:'Unable to store student'});
      });
    }
  }, (err) => {
    res.render("adminstudentadd.hbs", {name: req.user.name, msg:'Unable to store student'});
  });
});

app.get('/admin/student/update', ensureAuthenticated, (req, res) => {
  res.render('adminstudentupdate.hbs', {name: req.user.name});
});

app.post('/admin/student/modify', ensureAuthenticated, upload.single(), (req, res) => {
  let old_stud = {name: req.body.old_name, father: req.body.old_father, mother: req.body.old_mother, phone: req.body.old_phone, address: req.body.old_address};
  let new_stud = {name: req.body.new_name, father: req.body.new_father, mother: req.body.new_mother, phone: req.body.new_phone, address: req.body.new_address};
 
  StudentModel.findOneAndUpdate(old_stud, new_stud).then((stud) => {
    if (!stud) {
      res.render('adminstudentupdate.hbs', {name: req.user.name, msg:"No Student found"});
    } else {
      res.render('adminstudentupdate.hbs', {name: req.user.name, msg:"Student Updated"});
    }
  }, (err) => {
    res.render('adminstudentupdate.hbs', {name: req.user.name, msg:"Unable to update student"});
  });
});

app.get('/admin/student/remove', ensureAuthenticated, (req, res) => {
  res.render('adminstudentremove.hbs', {name: req.user.name});
});

app.post('/admin/student/delete', ensureAuthenticated, upload.single(), (req, res) => {
  StudentModel.findOneAndDelete({name: req.body.name, studentid: req.body.id}).then((student) => {
    if (!student) {
      res.render('adminstudentremove.hbs', {name: req.user.name, msg: "No Student Found"});
    } else {
      res.render('adminstudentremove.hbs', {name: req.user.name, msg: "Student Deleted"});
    }
  }, (err) => {
    res.render('adminstudentremove.hbs', {name: req.user.name, msg: "Unable to Delete"});
  });
})

// it will give remove batch form
app.get('/admin/student/removebatch', ensureAuthenticated, (req, res) => {
  res.render('adminstudentremovebatch.hbs', {name: req.user.name});
});

// it will completely remove students from database
// it will take passout year of the batch
// before removing this the class of the batch should be removed
app.post('/admin/student/deletebatch', ensureAuthenticated, upload.single(), (req, res) => {
  let passout_year = req.body.dop;
  StudentModel.deleteMany({dateOfPassout: passout_year}).then((students) => {
    res.render('adminstudentremovebatch.hbs', {name: req.user.name, msg: `${passout_year} Batch removed successfully`, total: students.deletedCount});
  }, (err) => {
    res.render('adminstudentremovebatch.hbs', {name: req.user.name, msg: 'Unable to remove batch'});
  });
});

// ----------------------------- Teacher Section ------------------------------------

app.get('/admin/teacher', ensureAuthenticated, (req, res) => {
  res.render('adminteacher.hbs', {name: req.user.name});
});

// show the add teacher form
app.get('/admin/teacher/add', ensureAuthenticated, (req, res) => {
  res.render('adminteacheradd.hbs', {name: req.user.name});
});

// store the teacher
app.post('/admin/teacher/save', ensureAuthenticated, upload.single('image'), (req, res) => {
  new TeacherModel({name: req.body.name, contact: req.body.contact, email: req.body.email, imagePath: req.file.filename}).save().then((teacher) => {
    res.render('adminteacheradd.hbs', {name: req.user.name, msg: 'Teacher added successfully.'});
  }, (err) => {
    res.render('adminteacheradd.hbs', {name: req.user.name, msg: 'duplicate value or invallid value'});
  });
});

// give all teacher with delete button
app.get('/admin/teacher/remove', (req, res) => {
  TeacherModel.find().then((teachers) => {
    if (teachers.length === 0) {
      res.render('adminteacherremove.hbs', {name: req.user.name, msg: 'No teacher found'});
    } else {
      res.render('adminteacherremove.hbs', {name: req.user.name, teachers});
    }
  }, (err) => {
    res.render('adminteacherremove.hbs', {name: req.user.name, msg: 'some error occured'});
  });
});

// delete the teacher
app.get('/admin/teacher/delete/:name/:email/:contact', ensureAuthenticated, (req, res) => {
  TeacherModel.findOneAndDelete({name: req.params.name, email: req.params.email, contact: req.params.contact}).then((teacher) => {
    // remove picture from upload folder
    let file = path.join(__dirname, '/public/upload/', teacher.imagePath);
    fs.unlink(file, (err) => {
      if (err) {
        res.json({err: 'Unable to delete teacher image'});
      }
    });
    TeacherModel.find().then((teachers) => {
      if (teachers.length === 0) {
        res.render('adminteacherremove.hbs', {name: req.user.name, msg: 'No teacher found'});
      } else {
        res.render('adminteacherremove.hbs', {name: req.user.name, teachers});
      }
    }, (err) => {
      res.render('adminteacherremove.hbs', {name: req.user.name, msg: 'some error occured'});
    });
  }, (err) => {
    res.render('adminteacherremove.hbs', {name: req.user.name, msg: 'some error occured while deleting'});
  });
});

// give the update form
app.get('/admin/teacher/update', ensureAuthenticated, (req, res) => {
  res.render('teacherupdateform.hbs', {name: req.user.name});
});

app.post('/admin/teacher/modify', ensureAuthenticated, upload.single(), (req, res) => {
  let old_data = {name: req.body.old_name, email: req.body.old_email, contact: req.body.old_contact};
  let new_data = {name: req.body.new_name, email: req.body.new_email, contact: req.body.new_contact};
  TeacherModel.findOneAndUpdate(old_data, new_data).then((teacher) => {
    TeacherModel.find().then((teachers) => {
      if (teachers.length === 0) {
        res.render('adminteacherremove.hbs', {name: req.user.name, msg: 'No teacher found'});
      } else {
        res.render('adminteacherremove.hbs', {name: req.user.name, teachers});
      }
    }, (err) => {
      res.render('adminteacherremove.hbs', {name: req.user.name, msg: 'some error occured'});
    });
  }, (err) => {
    res.render('adminteacherremove.hbs', {name: req.user.name, msg: 'some error occured while deleting'});
  });
});

// ------------------------------ Class Section -------------------------------------
app.get('/admin/class', ensureAuthenticated, (req, res) => {
  res.render('adminclass.hbs', {name: req.user.name});
});

app.get('/admin/class/add', ensureAuthenticated, (req, res) => {
  res.render('adminclassadd.hbs', {name: req.user.name});
});

app.post('/admin/class/store', ensureAuthenticated, upload.single(), (req, res) => {
  let _cls = req.body.class;
  let year = req.body.year;
  let no_of_section = Number(req.body.no_of_section);
  let section = [];
  for (let i = 0; i < no_of_section; i++) {
    section.push({sectionname: String.fromCharCode(65 + i)});
  }
  
  let cls = new ClassModel({year, class: _cls, section});
  ClassModel.findOne({class: _cls}).then((obj) => {
    if (obj) {
      res.render('adminclassadd.hbs', {name: req.user.name, msg: 'Class already exist'});
    } else {
      cls.save().then((obj) => {
        res.render('adminclassadd.hbs', {name: req.user.name, msg: 'Class created'});
      }, (err) => {
        res.render('adminclassadd.hbs', {name: req.user.name, msg: 'Unable to create Class'});
      });
    }
  }, (err) => {
    res.render('adminclassadd.hbs', {name: req.user.name, msg: 'Unable to create Class'});
  });
});

app.get('/admin/class/remove', ensureAuthenticated, (req, res) => {
  res.render('adminclassremove.hbs', {name: req.user.name});
});

// it will remove student from class and mark database. it will not remve student from student database.
// because after one class he/she will jump to go class.
app.post('/admin/class/delete', ensureAuthenticated, upload.single(), (req, res) => {
  ClassModel.findOneAndDelete({year: req.body.year, class: req.body.class}).then((cls) => {
    if (!cls) {
      res.render('adminclassremove.hbs', {name: req.user.name, msg: 'Class not found'});
    } else {
      // remove students from mark database
      for (let i=0; i < cls.section.length; i++) {
        for (let j = 0; j < cls.section[i].students.length; j++) {
          MarkModel.findOneAndDelete({id: cls.section[i].students[j].id}).then((std) => {}, (err) => {console.log(err)});
        }
      }

      res.render('adminclassremove.hbs', {name: req.user.name, msg: 'Class removed'});
    }
  }, (err) => {
    res.render('adminclassremove.hbs', {name: req.user.name, msg: 'unable to remove class'});
  });
});

app.get('/admin/class/addstudent', ensureAuthenticated, (req, res) => {
  res.render('adminclassaddstudent.hbs', {name: req.user.name});
});

// store student in the database
app.post('/admin/class/storestudent', ensureAuthenticated, upload.single(), (req, res) => {
  let cls = req.body.class;
  let section = req.body.section;
  let stud = {studentid: req.body.id, rollno: req.body.rollno};

    StudentModel.findOne({studentid: req.body.id}).then((student) => {
      if (!student) {
        res.render('adminclassaddstudent.hbs', {name: req.user.name, msg:'No student found'});
      } else {
        ClassModel.findOne({class: cls, 'section.sectionname': section}).then((clsobj) => {
          if (!clsobj) {
            res.render('adminclassaddstudent.hbs', {name: req.user.name, msg: 'No class or section found'});
          } else {
            //duplicate checking
            for (let i=0; i < clsobj.section.length; i++) {
              if (clsobj.section[i].sectionname === section) {
                for (let j=0; j < clsobj.section[i].students.length; j++) {
                  if (clsobj.section[i].students[j].studentid === stud.studentid) {
                    studentFound = true;
                    return res.render('adminclassaddstudent.hbs', {name: req.user.name, msg: 'Student already exists'});
                  }
                  else if (clsobj.section[i].students[j].rollno === stud.rollno) {
                    studentFound = true;
                    return res.render('adminclassaddstudent.hbs', {name: req.user.name, msg: 'Duplicate rollno'});
                  }
                }
              }
            }
            // end of duplicate checking
            for (let i = 0; i < clsobj.section.length; i++) {
              if (clsobj.section[i].sectionname === section) {
                clsobj.section[i].students.push(stud);
                new ClassModel(clsobj).save().then((obj) => {
                  // create marks entry for the student in the mark table
                  new MarkModel({class: cls, studentid: req.body.id}).save().then((markObj) => {}, (err) => {});
                  res.render('adminclassaddstudent.hbs', {name: req.user.name, msg: 'Student added'});
                }, (err) => {
                  res.render('adminclassaddstudent.hbs', {name: req.user.name, msg: 'Unable to add student'});
                });
              }
            }
          }
        }, (err) => {
          res.render('adminclassaddstudent.hbs', {name: req.user.name, msg: 'Unable to add Student'});
        });
      }
    }, (err) => {
      res.render('adminclassaddstudent.hbs', {name: req.user.name, msg: 'Unable to add Student'});
    });
});

app.get('/admin/class/removestudent', ensureAuthenticated, (req, res) => {
  res.render('adminclassremovestudent.hbs', {name: req.user.name});
});

// delete student from class
app.post('/admin/class/deletestudent', ensureAuthenticated, upload.single(), (req, res) => {
  let cls = req.body.class;
  let section = req.body.section;
  let rollno = req.body.rollno;
  let studentFound = false;

  ClassModel.findOne({class: cls, 'section.sectionname': section}).then((clsobj) => {
    if (!clsobj) {
      res.render('adminclassremovestudent.hbs', {name: req.user.name, msg: 'No class or section found'});
    } else {
      for (let i=0; i < clsobj.section.length; i++) {
        if (clsobj.section[i].sectionname === section) {
          for (let j=0; j < clsobj.section[i].students.length; j++) {
            if (clsobj.section[i].students[j].rollno === rollno) {
              clsobj.section[i].students.splice(j, 1);
              studentFound = true;
              new ClassModel(clsobj).save().then((obj) => {
                res.render('adminclassremovestudent.hbs', {name: req.user.name, msg: 'Student removed successfully'});
              }, (err) => {
                res.render('adminclassremovestudent.hbs', {name: req.user.name, msg: 'Unable to remove student'});
              });
            }req.user.name    }
          if (!studentFound){
            res.render('adminclassremovestudent.hbs', {name: req.user.name, msg: 'No student found'});
          }
        }
      }
    }
  }, (err) => {
    res.render('adminclassremovestudent.hbs', {name: req.user.name, msg: 'Unable to remove student'});
  });
});

app.get('/admin/class/search', ensureAuthenticated, (req, res) => {
  res.render('adminclasssearch.hbs', {name: req.user.name});
});

app.post('/admin/class/showlist', ensureAuthenticated, upload.single(), (req, res) => {
  let cls = req.body.class;
  ClassModel.findOne({class: cls}).then((clsobj) => {
    if (!clsobj) {
      res.render('adminclasssearch.hbs', {name: req.user.name, msg: 'Class not found'});
    } else {
      for (let i=0; i < clsobj.section.length; i++) {
        for (let j=0; j < clsobj.section[i].students.length; j++) {
          StudentModel.findOne({studentid: clsobj.section[i].students[j].studentid}).then((std) => {
            console.log(std)
            clsobj.section[i].students[j].name = std.name;
            clsobj.section[i].students[j].studentid = std.studentid;
            clsobj.section[i].students[j].phone = std.phone;
          }, (err) => {});
        }
      }
      res.render('adminclasssearch.hbs', {name: req.user.name, clsobj});
    }
  }, (err) => {
    res.render('adminclasssearch.hbs', {name: req.user.name, msg: 'Unable to search list'});
  });
});

// it will give class input foem to download the excel data
app.get('/admin/class/download', ensureAuthenticated, (req, res) => {
  res.render('adminclassdownloadform.hbs', {name: req.user.name});
});

// it will return the whole class
function getClass(cls) {
  return new Promise((resolve, reject) => {
    ClassModel.findOne({class: cls}).then((obj) => {
      resolve(obj);
    }, (err) => {
      reject(err);
    });
  });
}

// it will return the student object having the given id
function getStudent(studentid) {
  return new Promise((resolve, reject) => {
    StudentModel.findOne({studentid}).then((student) => {
      resolve(student);
    }).catch((err) => {
      reject(err);
    });
  });
}

// it will create the csv file and allow user to download the file
// stud name, father, mother, class, dob, gender, date of admission, adhar, address
app.post('/admin/class/downloadlist', ensureAuthenticated, upload.single(), async(req, res) => {
  let cls = req.body.class;
  // blank student array, will contain all students of the class which will convert into csv file
  let studentslist = []; 
  let clsObj = await getClass(cls);
  if (!clsObj) {
    return res.render('adminclassdownloadform.hbs', {name: req.user.name, msg: 'No class found'});
  }
  for (let i=0; i < clsObj.section.length; i++) {
    for (let j=0; j < clsObj.section[i].students.length; j++) {
      let student = await getStudent(clsObj.section[i].students[j].studentid);
      studentslist.push({name: student.name, father: student.father, mother: student.mother, class: cls, dob: student.dob, gender: student.gender, dateOfAdmission: student.dateOfAdmission, aadhar: student.adhar, address: student.address});
    }
  }
  // convert JSON to csv
  let csv = json2csv(studentslist, {fileds: ['name', 'father name', 'mother name', 'class', 'gender', 'dob', 'dateOfAdmission', 'aadhar', 'address']});
  fs.writeFileSync(`./public/downloads/class_${cls}.csv`, csv);
  res.download(`./public/downloads/class_${cls}.csv`);
  req.filepath = `./public/downloads/class_${cls}.csv`
  // delete csv file from server
});


// ------------------------------ Mark Section --------------------------------------

app.get('/admin/mark', ensureAuthenticated, (req, res) => {
  res.render('adminmark.hbs', {name: req.user.name});
});

// it will give the exam and class radio buttons
app.get('/admin/mark/examtype', ensureAuthenticated, (req, res) => {
  res.render('adminmarkexamtype.hbs', {name: req.user.name});
});

app.post('/admin/mark/add', ensureAuthenticated, upload.single(), (req, res) => {
  let cls = req.body.class;
  let exmtype = req.body.exm;
  SubjectModel.findOne({class: cls}).then((subjects) => {
    res.render('adminmarkform.hbs', {name: req.user.name, exm: exmtype, cls, subjects});
  }, (err) => {
    res.render('adminmarkexamtype.hbs', {name: req.user.name, msg: 'Unable to proceed'});
  });
});

function createMarkObj(req, res, next) {
  let cls = req.body.cls;
  let marks = [];
  let totalmark = 0;
  let scoredmark = 0;
  SubjectModel.findOne({class:cls}).then((subject) => {
    if (!subject) {
      res.render('adminmarkexamtype.hbs', {name: req.user.name, msg: 'class not exist in database'});
    } else {
        for (let i = 0; i < subject.subjects.length; i++) {
          if (req.body.exm === 'annual' || req.body.exm === 'halfyearly') {
            totalmark += subject.subjects[i].maxmark;
          } else {
            totalmark += subject.subjects[i].maxmark / 4;
          }
          scoredmark +=  Number(req.body[subject.subjects[i].name]);
          marks.push({subject: subject.subjects[i].name, mark: Number(req.body[subject.subjects[i].name])});
        }
        req.scoredmark = scoredmark;
        req.marks = marks;
        req.totalmark = totalmark;
        next();
    }
  }, (err) => {
    res.render('adminmarkexamtype.hbs', {name: req.user.name, msg: 'Unable to find subjects list'});
  });
}

app.post('/admin/mark/store', ensureAuthenticated, upload.single(), createMarkObj, (req, res) => {
  let exm = req.body.exm;
  let cls = req.body.cls;
  let studentid = req.body.id;

  ClassModel.findOne({class: cls, 'section.students.studentid': studentid}).then((clsObj) => {
    if (!clsObj) {
      res.render('adminmarkexamtype.hbs', {name: req.user.name, msg: 'Student not found in this class'});
    } else {
      MarkModel.findOne({class: cls, studentid: studentid}).then((student) => {
        if (!student) {
          res.render('adminmarkexamtype.hbs', {name: req.user.name, msg: 'Student not found in mark database'});
        } else {
          //student found in both class and mark database
          student.marks[exm].marks = req.marks;
          student.marks[exm].totalmark = req.scoredmark;
          student.marks[exm].percentage = (req.scoredmark / req.totalmark) * 100;
          new MarkModel(student).save().then((std) => {
            res.render('adminmarkexamtype.hbs', {name: req.user.name, msg: 'Mark Stored successfully'});
          }, (err) =>{
            res.render('adminmarkexamtype.hbs', {name: req.user.name, msg: 'Unable to store mark'});
          });
        }
      }, (err) => {
        res.render('adminmarkexamtype.hbs', {name: req.user.name, msg: 'Unable to store mark in database'});    
      });
    }
  }, (err) => {
    res.render('adminmarkexamtype.hbs', {name: req.user.name, msg: 'Unable to store mark in database'});
  });
});

// give the class and mark list form
app.get('/admin/mark/update', ensureAuthenticated, (req, res) => {
  res.render('adminmarkupdateform.hbs', {name: req.user.name});
});

// give the update form of different subjects with mark
app.post('/admin/mark/updatemarkform', ensureAuthenticated, upload.single(), (req, res) => {
  let cls = req.body.class;
  let exm = req.body.exm;
  let studentid = req.body.id;
  MarkModel.findOne({class:cls, studentid}).then((student) => {
    if (!student) {
      res.render('adminmarkupdateform.hbs', {name: req.user.name, msg: 'No student found in the class'});
    } else {
      let marks = student.marks[exm].marks;
      res.render('markupdateform.hbs', {name: req.user.name, marks, cls, exm, id: studentid});
    }
  }, (err) => {
    res.render('adminmarkupdateform.hbs', {name: req.user.name, msg: 'Unable to proceed'});
  });
});

// it will modify the mark. it is similar to add mark rout
// it will create another mark object nad replace the old one with new one
app.post('/admin/mark/modify', ensureAuthenticated, upload.single(), createMarkObj, (req, res) => {
  let exm = req.body.exm;
  let cls = req.body.cls;
  let studentid = req.body.id;

  ClassModel.findOne({class: cls, 'section.students.studentid': studentid}).then((clsObj) => {
    if (!clsObj) {
      res.render('adminmarkupdateform.hbs', {name: req.user.name, msg: 'Student not found in this class'});
    } else {
      MarkModel.findOne({class: cls, studentid: studentid}).then((student) => {
        if (!student) {
          res.render('adminmarkupdateform.hbs', {name: req.user.name, msg: 'Student not found in mark database'});
        } else {
          //student found in both class and mark database
          student.marks[exm].marks = req.marks;
          student.marks[exm].totalmark = req.scoredmark;
          student.marks[exm].percentage = (req.scoredmark / req.totalmark) * 100;
          new MarkModel(student).save().then((std) => {
            res.render('adminmarkupdateform.hbs', {name: req.user.name, msg: 'Mark updated successfully'});
          }, (err) =>{
            res.render('adminmarkupdateform.hbs', {name: req.user.name, msg: 'Unable to update mark'});
          });
        }
      }, (err) => {
        res.render('adminmarkupdateform.hbs', {name: req.user.name, msg: 'Unable to update mark in database'});    
      });
    }
  }, (err) => {
    res.render('adminmarkupdateform.hbs', {name: req.user.name, msg: 'Unable to update mark in database'});
  });
});


// ------------------------------ Notice Section ------------------------------------

app.get('/admin/notice', ensureAuthenticated, (req, res) => {
  res.render('adminnotice.hbs', {name: req.user.name});
});

// give the notice add form
app.get('/admin/notice/add', ensureAuthenticated, (req, res) => {
  res.render('adminnoticeadd.hbs', {name: req.user.name});
});
//store notice in database
app.post('/admin/notice/store', ensureAuthenticated, upload.single(), (req, res) => {
  new NoticeModel({noticeno: req.body.noticeno, date: req.body.date, notice: req.body.notice}).save().then((notice) => {
    res.render('adminnoticeadd.hbs', {name: req.user.name, msg: 'notice added successfully'});
  }, (err) => {
    res.render('adminnoticeadd.hbs', {name: req.user.name, msg: 'unable to add notice to database'});
  });
});

// send the page having all notice with remmove button
app.get('/admin/notice/remove', ensureAuthenticated, (req, res) => {
  NoticeModel.find().then((notices) => {
    if (notices.length === 0) {
      res.render('adminnoticeremove.hbs', {name: req.user.name, notices, msg: 'No Notice Found'});
    } else {
      res.render('adminnoticeremove.hbs', {name: req.user.name, notices});
    }
  }, (err) => {
    res.render('adminnoticeremove.hbs', {name: req.user.name, msg: 'some error occured'});
  });
});

// delete the message from database and show updated notice list
app.get('/admin/notice/delete/:noticeno', ensureAuthenticated, upload.single(), (req, res) => {
  NoticeModel.findOneAndDelete({noticeno: req.params.noticeno}).then((notice) => {
    NoticeModel.find().then((notices) => {
      if (notices.length === 0) {
        res.render('adminnoticeremove.hbs', {name: req.user.name, notices, msg: 'No Notice Found'});
      } else {
        res.render('adminnoticeremove.hbs', {name: req.user.name, notices});
      }
    }, (err) => {
      res.render('adminnoticeremove.hbs', {name: req.user.name, msg: 'some error occured'});
    });
  }, (err) => {
    res.render('adminnoticeremove.hbs', {name: req.user.name, msg: 'some error occured'});
  });
});



const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started at port ${port}`)
});
