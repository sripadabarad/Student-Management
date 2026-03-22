const mongoose = require("mongoose");   // database library

// create studentSchema for student CURD

const  studentSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,"Name is required"],
        trim:true,
        minlength:2,
        maxlength:50,
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        lowercase:true,
        trim:true,
    },
    phone:{
        type:String,
        trim:true
    },
    age:{
        type:Number,
        min:5,
        max:100,
    },
    course:{
        type:String,
        trim:true,
    },
    status:{
        type:String,
        enum:["active","inactive"],
        default:"active",
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    updatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null,
    },
    deletedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null,
    }
},{
    timestamps:true
});


module.exports = mongoose.model("Student",studentSchema);
