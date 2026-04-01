const Student = require("../model/studentModel");
const customError = require("../util/customError");
const mongoose = require("mongoose");


// CREATE
const createStudent = async(data, userId) => {
     const {name,email,phone, age, course, status} = data; // this data will come in req.body

    //email validation by express- validation

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
        createdBy:userId  // from auth req.user
    });
        return student;
    };

// GET ALL STUDENT
const getAllStudents = async( queryParams) =>{

    // ✅ destructuring added
     const { age, status, phone } = queryParams;

      // ✅  safe pagination
    const page = Math.max(Number(queryParams.page) || 1 , 1);
    const limit = Math.min(Number(queryParams.limit) || 10, 50);
    const search = queryParams.search?.trim() || "";
    const isDeleted = queryParams.isDeleted;

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

    // ✅ filters (NOW USING DESTRUCTURED VALUES)

    if(age){
        query.age = Number(age);
    }

    if(status){
        query.status = status;
    }

    if(phone){
        query.phone = phone.trim();
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
        return {
        students,
        pagination:{
            total,
            page,
            limit,
            totalPages,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null 
        }
     };
};

// GET SINGLE STUDENT
const getSingleStudent = async(id)=>{
    
      // ✅ ID validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new customError("Invalid student ID", 400);
    }

    // find student
    const student = await Student.findById(id);

    if (!student) {
        throw new customError("Student not found", 404);
    }

    return student;
};

// PUT (FULL UPDATE)
const updateStudentPUT = async(id, data, userId)=>{
    
    // id validation 

   if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new customError("Invalid student ID", 400);
    }

    // student validation 
    const student = await Student.findById(id);

    if (!student) {
        throw new customError("Student not found", 404);
    }

    const { name, email, phone, age, course, status } = data;

    // ✅ Email normalize + duplicate check
    let normalizedEmail;

    if (email) {
        normalizedEmail = email.trim().toLowerCase();

        const existing = await Student.findOne({
            email: normalizedEmail,
            _id: { $ne: id }
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
        updatedBy: userId
    };

        if (normalizedEmail) {
            updatedData.email = normalizedEmail;
        }

    const updatedStudent = await Student.findByIdAndUpdate(
        id,
        updatedData,
        { new: true, runValidators: true }
    );

        return updatedStudent;
};


// PATCH (PARTIAL UPDATE)
const updateStudentPATCH = async(id, data, userId) =>{

        if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new customError("Invalid student ID", 400);
    }

    const updatedData = {};

    const { name, email, phone, age, course, status } = data;

    if (name) updatedData.name = name;
    if (email && email.trim()){
        updatedData.email = email.trim().toLowerCase();
    } 
    if (phone) updatedData.phone = phone;
    if (age) updatedData.age = age;
    if (course) updatedData.course = course;
    if (status) updatedData.status = status;

    updatedData.updatedBy = userId;

    // ✅ Duplicate email check
    if (updatedData.email) {
        const existing = await Student.findOne({
            email: updatedData.email,
            _id: { $ne: id }
        });

        if (existing) {
            throw new customError("Email already exists", 400);
        }
    }

    const student = await Student.findByIdAndUpdate(
        id,
        updatedData,
        { new: true, runValidators: true }
    );

    if (!student) {
        throw new customError("Student not found", 404);
    }
        return student;
};

//  DELETE (SOFT DELETE)
const deleteStudent = async(id, userId)=> {

    //  ID validation check
     if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new customError("Invalid student ID", 400);
    }

    const student = await Student.findByIdAndUpdate(
        {
            _id: id,
            isDeleted:false //important: prevent re-delete
        },
        {
            isDeleted: true,
            deletedBy: userId
        },
        { new: true }
    );

    if (!student) {
        throw new customError("Student not found", 404);
    }
    return student;
};

module.exports =  {
    createStudent,
    getAllStudents,
    getSingleStudent,
    updateStudentPUT,
    updateStudentPATCH,
    deleteStudent
    };



