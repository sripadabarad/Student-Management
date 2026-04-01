const asyncHandler = require("../middleware/asyncHandler");
const studentService = require("../service/student.service.js");


//                 =================STUDENT CURD  =================

//  CREATE STUDENT 
const studentCreate = asyncHandler(async(req,res)=>{
        const student = await studentService.createStudent(req.body, req.user.id);

        res.status(201).json({
            success: true,
            message: "Student created successfully",
            data: student 
        });
    });

// GET ALL STUDENTS 
// (BY USING PADINATION + FILTER + SEARCH )

const getAllStudents = asyncHandler(async(req,res)=>{

    const result = await studentService.getAllStudents(req.query);

    res.status(200).json({
        success: true,
        message: "Student fetched successfully",
        data: result.students,
        pagination: result.pagination
    });
});

//  GET SINGLE 

const getSingleStudent = asyncHandler(async(req,res)=>{

   const student = await studentService.getSingleStudent(req.params.id);

    res.status(200).json({
        success: true,
        message: "Student fetched successfully",
        data: student
    })
});
// PUT (FULL UPDATE) 

const updateStudentPUT = asyncHandler(async (req, res) => {

    const updatedStudent = await studentService.updateStudentPUT(
            req.params.id,
            req.body,
            req.user.id
        );

    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: updatedStudent
    });
});

// PATCH (PARTIAL UPDATE) 

const updateStudentPATCH = asyncHandler(async (req, res) => {

   const student = await studentService.updateStudentPATCH(
    req.params.id,
    req.body,
    req.user.id
   );

    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: student
    });
});

// DELETE (SOFT DELETE) 

const deleteStudent = asyncHandler(async (req, res) => {

    const id  = req.params.id;
    const userId = req.user.id;

    await studentService.deleteStudent(
        id,
        userId
    );

    res.status(200).json({
        success: true,
        message: "Student deleted successfully",
        deletedId:id,
        deletedBy:userId
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





















