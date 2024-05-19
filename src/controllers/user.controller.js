import {asyncHandler} from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req,res)=>{
    const {username,email,mobileNumber,password} = req.body;
    // console.log(username + " " + email);

    if(
        [username,email,mobileNumber,password].some((field)=> field?.trim()=== "")
    ){
        throw new ApiError(400,"All fields are required");
    }

    const existedUser = await User.findOne({
        $or:[{username},{email}],
    });

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists");
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

    if(!createdUser){
        throw new ApiError(500,"something went wrong while creating user!");
    }

    return res 
    .status(201)
    .json(new ApiResponse(200,createdUser,"user registered successfully"));

});

export {registerUser};