const express = require("express");
const multer = require("multer")
const hbs = require("hbs");
const path = require("path")

// local modules
const {mongoose} = require('./db/mongoose');
const {TeacherModel} = require('./models/teachers');
const {NoticeModel} = require('./models/notice');
const {StudentModel} = require("./models/students")


const app = express();

const storage = multer.diskStorage({
  destination: './public/upload/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage
});


app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname,"/public/css")));
app.use(express.static(path.join(__dirname,"/public/images")));
app.use(express.static(path.join(__dirname, '/public/upload')))


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started at port ${port}`)
});

// before login common rout
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

app.get('/admin/login', (req, res) => {
  res.render('adminlogin.hbs');
});

// student routs after login
app.get('/student/home', (req, res) => {
  res.render('studenthome.hbs', {name:'Biswajeet'});
});



// admin routs after login
app.get('/admin/home', (req, res) => {
  res.render('adminhome.hbs', {name: 'Admin'});
});

// ----------------------------- Student Section ------------------------------------
app.get('/admin/student', (req, res) => {
  res.render('adminstudent.hbs', {name: 'Admin'});
});

app.get('/admin/student/add', (req, res) => {
  res.render('adminstudentadd.hbs');
});

app.post('/admin/student/store', upload.single(), (req, res) => {
  let name = req.body.name;
  let father = req.body.father;
  let mother = req.body.mother;
  let dateOfJoin = req.body.doj;
  let dateOfPassout = req.body.dop;
  let address = req.body.address;
  let phone = req.body.phone;
  let id = name + phone.slice(phone.length-3, phone.length);
  let password = dateOfJoin + phone.slice(phone.length-3, phone.length);

  let student = new StudentModel({name, father, mother, dateOfJoin, dateOfPassout, address, phone, id, password});
  StudentModel.findOne(student).then((stud) => {
    if (stud) {
      res.render("adminstudentadd.hbs", {name: 'Admin', msg:'Duplicate Student not Allowed'});
    } else {
      student.save().then((student) => {
        res.render("adminstudentadd.hbs", {name: 'Admin', account:{id, password}});
      }, (err) => {
        res.render("adminstudentadd.hbs", {name: 'Admin', msg:'Unable to store student'});
      });
    }
  }, (err) => {
    res.render("adminstudentadd.hbs", {name: 'Admin', msg:'Unable to store student'});
  });
});

app.get('/admin/student/update', (req, res) => {
  res.render('adminstudentupdate.hbs', {name: 'Admin'});
});

app.post('/admin/student/modify', upload.single(), (req, res) => {
  let old_stud = {name: req.body.old_name, father: req.body.old_father, mother: req.body.old_mother, phone: req.body.old_phone, address: req.body.old_address};
  let new_stud = {name: req.body.new_name, father: req.body.new_father, mother: req.body.new_mother, phone: req.body.new_phone, address: req.body.new_address};
 
  StudentModel.findOneAndUpdate(old_stud, new_stud).then((stud) => {
    if (!stud) {
      res.render('adminstudentupdate.hbs', {name: 'Admin', msg:"No Student found"});
    } else {
      res.render('adminstudentupdate.hbs', {name: 'Admin', msg:"Student Updated"});
    }
  }, (err) => {
    res.render('adminstudentupdate.hbs', {name: 'Admin', msg:"Unable to update student"});
  });
});

app.get('/admin/student/remove', (req, res) => {
  res.render('adminstudentremove.hbs', {name: 'Admin'});
});

app.post('/admin/student/delete', upload.single(), (req, res) => {
  StudentModel.findOneAndDelete({name: req.body.name, id: req.body.id}).then((student) => {
    if (!student) {
      res.render('adminstudentremove.hbs', {name: 'Admin', msg: "No Student Found"});
    } else {
      res.render('adminstudentremove.hbs', {name: 'Admin', msg: "Student Deleted"});
    }
  }, (err) => {
    res.render('adminstudentremove.hbs', {name: 'Admin', msg: "Unable to Delete"});
  });
})

// ----------------------------- Teacher Section ------------------------------------

app.get('/admin/teacher', (req, res) => {
  res.render('adminteacher.hbs', {name: 'Admin'});
});

// show the add teacher form
app.get('/admin/teacher/add', (req, res) => {
  res.render('adminteacheradd.hbs', {name: 'Admin'});
});

// store the teacher
app.post('/admin/teacher/save', upload.single('image'), (req, res) => {
  new TeacherModel({name: req.body.name, contact: req.body.contact, email: req.body.email, imagePath: req.file.filename}).save().then((teacher) => {
    res.render('adminteacheradd.hbs', {name: 'Admin', msg: 'Teacher added successfully.'});
  }, (err) => {
    res.render('adminteacheradd.hbs', {name: 'Admin', msg: 'duplicate value or invallid value'});
  });
});

// give all teacher with delete button
app.get('/admin/teacher/remove', (req, res) => {
  TeacherModel.find().then((teachers) => {
    if (teachers.length === 0) {
      res.render('adminteacherremove.hbs', {name: "Admin", msg: 'No teacher found'});
    } else {
      res.render('adminteacherremove.hbs', {name: "Admin", teachers});
    }
  }, (err) => {
    res.render('adminteacherremove.hbs', {name: 'Admin', msg: 'some error occured'});
  });
});

// delete the teacher
app.get('/admin/teacher/delete/:name/:email/:contact', (req, res) => {
  TeacherModel.findOneAndDelete({name: req.params.name, email: req.params.email, contact: req.params.contact}).then((teacher) => {
    TeacherModel.find().then((teachers) => {
      if (teachers.length === 0) {
        res.render('adminteacherremove.hbs', {name: "Admin", msg: 'No teacher found'});
      } else {
        res.render('adminteacherremove.hbs', {name: "Admin", teachers});
      }
    }, (err) => {
      res.render('adminteacherremove.hbs', {name: 'Admin', msg: 'some error occured'});
    });
  }, (err) => {
    res.render('adminteacherremove.hbs', {name: 'Admin', msg: 'some error occured while deleting'});
  });
});

// give the update form
app.get('/admin/teacher/update', (req, res) => {
  res.render('teacherupdateform.hbs', {name: 'Admin'});
});

app.post('/admin/teacher/modify',upload.single(), (req, res) => {
  let old_data = {name: req.body.old_name, email: req.body.old_email, contact: req.body.old_contact};
  let new_data = {name: req.body.new_name, email: req.body.new_email, contact: req.body.new_contact};
  TeacherModel.findOneAndUpdate(old_data, new_data).then((teacher) => {
    TeacherModel.find().then((teachers) => {
      if (teachers.length === 0) {
        res.render('adminteacherremove.hbs', {name: "Admin", msg: 'No teacher found'});
      } else {
        res.render('adminteacherremove.hbs', {name: "Admin", teachers});
      }
    }, (err) => {
      res.render('adminteacherremove.hbs', {name: 'Admin', msg: 'some error occured'});
    });
  }, (err) => {
    res.render('adminteacherremove.hbs', {name: 'Admin', msg: 'some error occured while deleting'});
  });
});

// ------------------------------ Notice Section ------------------------------------

app.get('/admin/notice', (req, res) => {
  res.render('adminnotice.hbs', {name: 'Admin'});
});

// give the notice add form
app.get('/admin/notice/add', (req, res) => {
  res.render('adminnoticeadd.hbs', {name: 'Admin'});
});
//store notice in database
app.post('/admin/notice/store', upload.single(), (req, res) => {
  new NoticeModel({noticeno: req.body.noticeno, date: req.body.date, notice: req.body.notice}).save().then((notice) => {
    res.render('adminnoticeadd.hbs', {name: 'Admin', msg: 'notice added successfully'});
  }, (err) => {
    res.render('adminnoticeadd.hbs', {name: 'Admin', msg: 'unable to add notice to database'});
  });
});

// send the page having all notice with remmove button
app.get('/admin/notice/remove', (req, res) => {
  NoticeModel.find().then((notices) => {
    if (notices.length === 0) {
      res.render('adminnoticeremove.hbs', {name: 'Admin', notices, msg: 'No Notice Found'});
    } else {
      res.render('adminnoticeremove.hbs', {name: 'Admin', notices});
    }
  }, (err) => {
    res.render('adminnoticeremove.hbs', {name: 'Admin', msg: 'some error occured'});
  });
});

// delete the message from database and show updated notice list
app.get('/admin/notice/delete/:noticeno', upload.single(), (req, res) => {
  NoticeModel.findOneAndDelete({noticeno: req.params.noticeno}).then((notice) => {
    NoticeModel.find().then((notices) => {
      if (notices.length === 0) {
        res.render('adminnoticeremove.hbs', {name: 'Admin', notices, msg: 'No Notice Found'});
      } else {
        res.render('adminnoticeremove.hbs', {name: 'Admin', notices});
      }
    }, (err) => {
      res.render('adminnoticeremove.hbs', {name: 'Admin', msg: 'some error occured'});
    });
  }, (err) => {
    res.render('adminnoticeremove.hbs', {name: 'Admin', msg: 'some error occured'});
  });
});