const express = require("express");
const router = express.Router();

//add controller data
const {
     studentCreate,
    getAllStudents,
    getSingleStudent,
    updateStudentPUT,
    updateStudentPATCH,
    deleteStudent
} = require("../controller/studentController");

// PROTECTED AND RABC MIDDLEWARE
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");

// STUDENT VALIDATION
const {
    createStudentValidation,
    updateStudentPUTValidator,
    updateStudentPATCHValidation
} = require("../validator/studentValidator");
const validateRequest = require("../middleware/validationRequest");
const paginationValidator = require("../validator/paginationValidator");

//API Endpoints ROOUTES

// CREATE (protected) admin only
router.post("/",
    authentication,
    authorization("admin","teacher"),
    createStudentValidation,
    validateRequest,
    studentCreate
);

//UPDATED PUT(protected) admin only
router.put("/:id",
    authentication,
    authorization("admin"),
    updateStudentPUTValidator,
    validateRequest,
    updateStudentPUT
);

//UPDATED PATCH(protected) admin only
router.patch("/:id",
    authentication,
    authorization("admin"),
    updateStudentPATCHValidation,
    validateRequest,
    updateStudentPATCH
);

//DELETED (protected) admin only
router.delete("/:id",
    authentication,
    authorization("admin"),
    deleteStudent
);


//GET (optionl)

router.get("/",
    authentication,
    authorization("admin","teacher","user"),
    paginationValidator,
    validateRequest,
    getAllStudents);

router.get("/:id",
    authentication,
    authorization("admin","teacher","user"),
    getSingleStudent);

module.exports  = router;
