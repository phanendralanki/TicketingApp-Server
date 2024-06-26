import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, //To enable searching- optimized way
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: [true, "Mobile number already registered"],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user","developer"], //Enums in JavaScript are used to represent a fixed set of named values.
      default: "user",
    },
    refreshToken: {
      type: String,
    },
    resetPasswordToken:{
      type:String,
    },
    resetPasswordExpire:{
      type:String,
    }
  },
  { timestamps: true }
);

//password hashing before saving it into the db
userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
});

//password encoding - useful during login
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password); //true or false
}

//Accesstoken
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        mobileNumber:this.mobileNumber, //this.mobileNumber - from db
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};

//refreshToken
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};

//Reset Token
userSchema.methods.getResetToken = function(){
  //use crypto - default in nodejs
  const resetToken = crypto.randomBytes(20).toString("hex");
  //algorithm to hash Password
  this.resetPasswordToken = crypto 
  .createHash("sha256")
  .update(resetToken)
  .digest("hex");
  //setting expire
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; //15 minutes
  return resetToken;
};


export const User = mongoose.model("User", userSchema);
