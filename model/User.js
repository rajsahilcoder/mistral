const Mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
const UserSchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  role: {
    type: String,
    
    required: true,
  },
});
UserSchema.plugin(passportLocalMongoose);
const User = Mongoose.model("user", UserSchema);

module.exports = User;