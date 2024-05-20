import mongoose, { mongo } from "mongoose";

const issueSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:['open','in_progress','resolved','closed'],
        default:'open'
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:null,
    },

},{
    timestamps:true,
});

export const Issue = mongoose.model('Issue',issueSchema);  