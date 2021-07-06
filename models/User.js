const { ObjectId } = require('mongoose');
const mongoose = require('mongoose');

//------------ User Schema ------------//
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  whatsapp: {
    type: Number
  },
  upiaddress: {
    type: String
  },
  withdrawname: {
    type: String
  },
  game1: [ String ],
  game2: [ String ],
  game3: [ String ],
  game4: [ String ],
  recharge: [ String ],
  withdraw: [ String ],
  refcount: {
    type: Number,
    default: 0
  },
  refbal: {
    type: Number,
    default: 0
  },
  refto: [ String ],
  reffrom: {
    type: String,
    default: ''
  },
  balance: {
    type: Number,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  resetLink: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;