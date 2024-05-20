import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import {sendEmail} from "../utils/SendMail.js";
import crypto from "crypto";

// only internal method - so no need of asyncHandler(used for web requests)
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //saving refresh token in db
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //because some fields are required to validate

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating and refresh and access Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, mobileNumber, password } = req.body;
  // console.log(username + " " + email);

  if (
    [username, email, mobileNumber, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const user = await User.create({
    username,
    email,
    mobileNumber,
    password,
  });

  //Getting the data without password and refreshToken
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while creating user!");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
   //req body ==> data
  //username or email
  //find the user
  //password check
  //Generate access and refresh Token
  //send cookie - access and refresh Token
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  //generating access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //sending accessToken and refreshToken in cookies

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true, //only modifiable by server
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});


//End point to generate new AccessToken
const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = 
  req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request");
  }

  try{
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );


    const user = await User.findById(decodedToken?._id);
    if(!user){
      throw new ApiError(401,"Invalid refresh Token");
    }

    if(!incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh Token is expired or used");
    }

    const options = {
      httpOnly:true,
      secure:true,
    };


    const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id);

    return res 
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken,refreshToken:newRefreshToken},
        "Access token Refreshed"
      )
    );
  }catch(error){
    throw new ApiError(401,error?.message || "Invalid refresh Token");
  }


});


//Logout
const logoutUser = asyncHandler(async (req,res)=>{
  //remove the cookies - access and refreshToken
  //delete the refreshToken from db
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset:{
        refreshToken:1, //this removes the field from document.
      },
    },
    {
      new:true,
    }
  );


  const options = {
    secure:true,
    httpOnly:true,
  };

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User Logged Out Successfully"));


});


//forgot password
const forgotPassword = asyncHandler(async(req,res,next)=>{
  const {email} = req.body;
  const user = await User.findOne({email});
  if(!user) return next(new ApiError(400,"No user with this email"));

  const resetToken = await user.getResetToken();
  await user.save();
  const url = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;
  //http://localhost:3000/resetPassword/fasfaj23423

  const message = `Click on the link to reset your password. ${url}. If you haven't requested then please ignore`;

  //send token via email
  await sendEmail(user.email,"OneYes Reset Password",message);
  res.status(200).json({
    success:true,
    message:`Reset Token has been sent to ${user.email}`,
  });

});


//reset Password
const resetPassword = asyncHandler(async(req,res,next)=>{
  const {token} = req.params;
  const resetPasswordToken = crypto
  .createHash("sha256")
  .update(token)
  .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{
      $gt:Date.now(),
    },
  });

  if(!user)
    throw new ApiError(500,"Token is invalid or has been expired");

  //if user found
  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;
  await user.save();

  res.status(200).json(new ApiResponse(200,"Password changed successfully"));

});

export { registerUser, loginUser,logoutUser,refreshAccessToken,forgotPassword,resetPassword };
