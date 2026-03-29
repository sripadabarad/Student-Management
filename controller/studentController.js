const Student = require("../model/studentModel");
const customError = require("../util/customError");
const asyncHandler = require("../middleware/asyncHandler");
const mongoose = require("mongoose");


//STUDENT CURD 

// ================= CREATE STUDENT =================

const studentCreate = asyncHandler(async(req,res,next)=>{

    const {name,email,phone, age, course, status} = req.body; // this data will come in req.body

    //email validation
    if(!email){
        throw new customError("Email is required",400)
    }
     // normalize email
    const normalizedEmail = email.trim().toLowerCase()

    //Validation handled by express - validator

    // Duplicate Student check

    const existing = await Student.findOne({ email : normalizedEmail  });
    if(existing){
        throw new customError("Email already exists",400)
    }

    // if student not exists then create a new student
    const student = await Student.create({
        name,
        email:normalizedEmail,
        phone,
        age,
        course,
        status,
        createdBy:req.user.id  // from auth req.user
    });

    res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: student 
    });
});

// ================= GET ALL STUDENTS =================
// (BY USING PADINATION + FILTER + SEARCH )

const getAllStudents = asyncHandler(async(req,res,next)=>{

    // ✅  safe pagination
    const page = Math.max(Number(req.query.page) || 1 , 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";
    const isDeleted = req.query.isDeleted;

    const skip = (page - 1) * limit;

    // ✅ base query (soft delete)
    const query = {};    // we created query objects to add conditions for find

        if(isDeleted!==undefined){
            query.isDeleted = isDeleted === "true";
        }else{
            query.isDeleted = false ;
        };

    // ✅ search if only value exists
    if(search){
        query.$or =[
            {name:{$regex:search, $options:"i"}},
            {email:{$regex:search, $options:"i"}},
            {course:{$regex:search, $options:"i"}},
        ];
    }

    // ✅ Filters for the (Exact match )
    if(req.query.age){
        query.age = Number(req.query.age);
    }

    if(req.query.status){
        query.status = req.query.status;
    }

    if(req.query.phone){
        query.phone = req.query.phone.trim();
    }
     // ✅ Fetch data

     const students = await Student.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt : -1 });

    //   ✅ count total (counts the matchig data)
    
    const total = await Student.countDocuments(query);

    const totalPages = Math.ceil(total/limit);

    // ✅ Response to the client
     res.status(200).json({
        success: true,
        message: "Student Fetched successfully",
        data: students,
        pagination:{
            total: total,
            page,
            limit,
            totalPages,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null 
        }
     })
});

// ================= GET SINGLE =================

const getSingleStudent = asyncHandler(async(req,res,next)=>{

    // ✅ ID validation
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new customError("Invalid student ID", 400);
    }
    // find by unique ID

    const student = await Student.findById(req.params.id);  // params get the id from the URL

    if(!student){
        throw new customError("Student not found",404)
    }
    // if student id found then responce to the client

    res.status(200).json({
        success: true,
        message: "Student fetched successfully",
        data: student
    })
});
// ================= PUT (FULL UPDATE) =================

const updateStudentPUT = asyncHandler(async (req, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new customError("Invalid student ID", 400);
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
        throw new customError("Student not found", 404);
    }

    const { name, email, phone, age, course, status } = req.body;

    // Email is required 
    if(!email){
        throw new customError("Email is required",400);
    }
    // ✅ Email normalize + duplicate check
    let normalizedEmail;

    if (email) {
        normalizedEmail = email.trim().toLowerCase();

        const existing = await Student.findOne({
            email: normalizedEmail,
            _id: { $ne: req.params.id }
        });

        if (existing) {
            throw new customError("Email already exists", 400);
        }
    }

    const updatedData = {
        name,
        phone,
        age,
        course,
        status,
        updatedBy: req.user.id
    };


        if (normalizedEmail) {
            updatedData.email = normalizedEmail;
        }

    const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: updatedStudent
    });
});

// ================= PATCH (PARTIAL UPDATE) =================

const updateStudentPATCH = asyncHandler(async (req, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new customError("Invalid student ID", 400);
    }

    const updatedData = {};

    const { name, email, phone, age, course, status } = req.body;

    if (name) updatedData.name = name;
    if (email && email.trim()){
        updatedData.email = email.trim().toLowerCase();
    } 
    if (phone) updatedData.phone = phone;
    if (age) updatedData.age = age;
    if (course) updatedData.course = course;
    if (status) updatedData.status = status;

    updatedData.updatedBy = req.user.id;

    // ✅ Duplicate email check
    if (updatedData.email) {
        const existing = await Student.findOne({
            email: updatedData.email,
            _id: { $ne: req.params.id }
        });

        if (existing) {
            throw new customError("Email already exists", 400);
        }
    }

    const student = await Student.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true, runValidators: true }
    );

    if (!student) {
        throw new customError("Student not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: student
    });
});

// ================= DELETE (SOFT DELETE) =================

const deleteStudent = asyncHandler(async (req, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new customError("Invalid student ID", 400);
    }

    const student = await Student.findByIdAndUpdate(
        req.params.id,
        {
            isDeleted: true,
            deletedBy: req.user.id
        },
        { new: true }
    );

    if (!student) {
        throw new customError("Student not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Student deleted successfully",
        data: null
    });
});

module.exports = {
    studentCreate,
    getAllStudents,
    getSingleStudent,
    updateStudentPUT,
    updateStudentPATCH,
    deleteStudent
};





















