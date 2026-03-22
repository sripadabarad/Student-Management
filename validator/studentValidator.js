const {body} = require("express-validator");

// ================= CREATE =================

const createStudentValidation = [
    body("name")
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3, max: 50 }).withMessage("Name must be 3-50 characters"),

    body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid Email format")
    .normalizeEmail(),

    body("phone")
    .notEmpty().withMessage("Phone number is required")
    .isMobilePhone().withMessage("Invalid phone number"),

    body("age")
    .notEmpty().withMessage("Age is required")
    .isInt({ min: 1, max: 100 }).withMessage("Age must be between 1 and 100"),

    body("course")
    .notEmpty().withMessage("Course is required")
    .isLength({ min:2 }).withMessage("course name is too short"),

    body("status")
    .optional()
    .isIn(["active" , "inactive"]).withMessage("Status must be active or inactive")
];

// ================= UPDATE(PUT) =================
const updateStudentPUTValidator = [
     body("name")
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3, max: 50 }).withMessage("Name must be 3-50 characters"),

    body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid Email format")
    .normalizeEmail(),

    body("phone")
    .notEmpty().withMessage("Phone number is required")
    .isMobilePhone().withMessage("Invalid phone number"),

    body("age")
    .notEmpty().withMessage("Age is required")
    .isInt({ min: 1, max: 100 }).withMessage("Age must be between 1 and 100"),

    body("course")
    .notEmpty().withMessage("Course is required")
    .isLength({ min:2 }).withMessage("course name is too short"),

    body("status")
    .optional()
    .isIn(["active" , "inactive"]).withMessage("Status must be active or inactive")
];

// ================= UPDATE (PATCH) =================
const updateStudentPATCHValidation = [
    
    body("name")
        .optional()
        .isLength({ min: 3, max: 50 }).withMessage("Name must be 3-50 characters"),

    body("email")
        .optional()
        .isEmail().withMessage("Invalid email")
        .normalizeEmail(),

    body("phone")
        .optional()
        .isMobilePhone().withMessage("Invalid phone number"),

    body("age")
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage("Age must be between 1 and 100"),

    body("course")
        .optional()
        .isLength({ min: 2 }).withMessage("Course is too short"),

    body("status")
        .optional()
        .isIn(["active", "inactive"]).withMessage("Status must be active or inactive")
];

module.exports = {
    createStudentValidation,
    updateStudentPUTValidator,
    updateStudentPATCHValidation
};