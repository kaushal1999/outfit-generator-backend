import { Schema, model } from "mongoose";
import  bcrypt  from "bcryptjs";
import jwt from "jsonwebtoken";


const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is Required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password length should be 6 character long"],
  },
  inputMessages: {
    type:Array
  },
  outputMessages: {
    type:Array
  },
  userPref: {
    type: Array
  },
  favourites:{
    type:Array
  }
});


userSchema.pre("save", async function (next) {
  
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password =  bcrypt.hash(this.password, salt);
  next();
});


userSchema.methods.matchPassword = async function (password) {
  
  return password===this.password;
};


userSchema.methods.getSignedToken = function (res) {
  const accessToken = jwt.sign(
    { id: this._id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIREIN }
  );

  return accessToken;
    
  
};

const User = model("User", userSchema);

export default User;
