const mongoose = require('mongoose');

// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/dmps', { useNewUrlParser:true });

// marks will be removed by using class
// all marks with same class should be removed at a time
const markSchema = new mongoose.Schema({
  studentid: {
    type: String,
    required: true,
    minlength: 4,
    trim: true,
    unique: true
  }, 
  class: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 3,
    trim: true
  },
  marks: {
    monthly1: {
      marks: [{
        subject: {
          type: String,
          minlength: 1,
          trim: true,
          unique: true,
          required: true
        },
        mark: {
          type: Number,
          required: true,
          default: 0.0
        }
      }],
      totalmark: {
        type: Number,
        default: 0.0
      },
      percentage: {
        type: Number,
        default: 0
      }
    },
    monthly2: {
      marks: [{
        subject: {
          type: String,
          minlength: 1,
          trim: true,
          unique: true,
          required: true
        },
        mark: {
          type: Number,
          required: true,
          default: 0.0
        }
      }],
      totalmark: {
        type: Number,
        default: 0.0
      },
      percentage: {
        type: Number,
        default: 0
      }
    },
    monthly3: {
      marks: [{
        subject: {
          type: String,
          minlength: 1,
          trim: true,
          unique: true,
          required: true
        },
        mark: {
          type: Number,
          required: true,
          default: 0.0
        }
      }],
      totalmark: {
        type: Number,
        default: 0.0
      },
      percentage: {
        type: Number,
        default: 0
      }
    },
    monthly4: {
      marks: [{
        subject: {
          type: String,
          minlength: 1,
          trim: true,
          unique: true,
          required: true
        },
        mark: {
          type: Number,
          required: true,
          default: 0.0
        }
      }],
      totalmark: {
        type: Number,
        default: 0.0
      },
      percentage: {
        type: Number,
        default: 0
      }
    },
    halfyearly: {
      marks: [{
        subject: {
          type: String,
          minlength: 1,
          trim: true,
          unique: true,
          required: true
        },
        mark: {
          type: Number,
          required: true,
          default: 0.0
        }
      }],
      totalmark: {
        type: Number,
        default: 0.0
      },
      percentage: {
        type: Number,
        default: 0
      }
    },
    annual: {
      marks: [{
        subject: {
          type: String,
          minlength: 1,
          trim: true,
          unique: true,
          required: true
        },
        mark: {
          type: Number,
          required: true,
          default: 0.0
        }
      }],
      totalmark: {
        type: Number,
        default: 0.0
      },
      percentage: {
        type: Number,
        default: 0
      }
    }
  }
});

const MarkModel = mongoose.model('Marks', markSchema);

// let mark = new MarkModel({
//   id: "1234",
//   class: '1',
// })

// mark.save().then((mark) => {}, (err) => {console.log(err)});


module.exports = { MarkModel };