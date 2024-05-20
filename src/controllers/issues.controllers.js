import {Issue} from "../models/issues.model.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/AsyncHandler.js";

//create an issue
const createIssue = asyncHandler(async(req,res)=>{
    try{
        const {title,description} = req.body;
        const issue = new Issue({title,description,createdBy:req.user._id});
        await issue.save();
        return res
        .status(201)
        .json(new ApiResponse(200,{issue},"issue created successfully"));

    }catch(error){
        throw new ApiError(401,error?.message);
    }
});

//Get issues for an user
const getUserIssues = async(req,res)=>{
    try{
        const issues = await Issue.find({createdBy:req.user._id});
        return res 
        .status(200)
        .json(new ApiResponse(200,{issues},"Here are the issues"));
    }catch(error){
        throw new ApiError(401,error?.message);
    }
};

export {createIssue,getUserIssues};