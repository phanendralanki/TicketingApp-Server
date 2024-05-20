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

//update issue
const updateIssue = asyncHandler(async(req,res)=>{
    try{
        const {id} = req.params;
        const {title,description} = req.body;
        const updatedIssue = await Issue.findByIdAndUpdate(id,{
            title,description
        },{
            new:true,
            runValidators:true
        });
        if(!updatedIssue){
            throw new ApiError(404,"Issuse not found");
        }
        res.json({updatedIssue});

    }catch(error){
        throw new ApiError(400,error?.message)
    }
});

//delete issue
const deleteIssue = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    try{
        const deletedIssue = await Issue.findByIdAndDelete(id);
        if(!deleteIssue){
            throw new ApiError(404,error?.message||"Issue not found");
        }

        return res.status(200).json(new ApiResponse(200,"Issue Deleted Successfully"));

    }catch(error){
        throw new ApiError(500,error?.message);
    }
});

export {createIssue,getUserIssues,updateIssue,deleteIssue};