const Student = require("../model/studentModel");
const customError = require("../util/customError");
const asyncHandler = require("../middleware/asyncHandler");


//STUDENT CURD 

// 1- CREATE STUDENT BY USING (ROLE BASED ACCESS CONTROLL);

const studentCreate = asyncHandler(async(req,res,next)=>{

    const {name,email,phone, age, course, status} = req.body;

    if(!name || !email || !phone || !age || !course || !status){
        throw new customError("All fields are required");
    }

    const student = await Student.create({
        name,
        email,
        phone,
        age,
        course,
        status,
        createdBy:req.user.id  // from auth req.user
    });

    res.status(201).json({
        success:true,
        message: "Student created successfully",
        student 
    });
});

