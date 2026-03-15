const { body , param } = require("express-validator"); //import body and param 
const customError = require("../util/customError");

// Register Validation

//regrex for strong passowrd:
// At least 1 uppercase , 1 lowercase , 1 numeric digit , 1 symbols
const strongPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/;

const registerValidator =  [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is Required"),

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid Email is Required"),
    
    body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is Required")
    .isLength({min : 6 })
    .withMessage("password must be atleast 6 characters")
    .matches(strongPassword)
    .withMessage("Password must include uppercase, lowercase, number, and special character"),

    body("role")
    .optional()
    .isIn(["admin" , "teacher" ,"student"])
    .withMessage("role must be admin , teacher or student")

]

//\Login validator

const loginValidator = [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid Email is required "),

    body("password")
    .notEmpty()
    .withMessage("Password is required")
];


// Change password

const changePasswordValidator = [

    body("oldPassword")
    .notEmpty()
    .withMessage("old password is required"),

    body("newPassword")
    .notEmpty()
    .withMessage("new password is required")
    .isLength({min:6})
    .withMessage("new password must be at least 6 characters")
    .matches(strongPassword)
    .withMessage("Password must includes upercase , lowercase , number and special characters"),

    body("confirmPassword")
    .notEmpty()
    .withMessage("confirm password is required")
    .custom((value,{req})=>{
        if(value!==req.body.newPassword){
            throw new customError("Password do not match",400)
        }
        return true;
    })
];

//forgotPassword

const forgotPasswordValidator = [

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required")

];


// ResetPassword

const resetPasswordValidator = [

    param("resetToken")
    .notEmpty()
    .withMessage("ResetToken is required"),

    body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min:6 })
    .withMessage("new password must be at least 6 characters")
    .matches(strongPassword)
    .withMessage("Password must includes upercase , lowercase , number and special characters"),

    body("confirmPassword")
    .notEmpty()
    .withMessage("confirm password is required")
    .custom((value , {req})=>{
        if(value !== req.body.newPassword){
            throw new customError("Password do not match",400)
        }
        return true;
    })
];


module.exports = {
    registerValidator , 
    loginValidator,
    changePasswordValidator,
    forgotPasswordValidator,
    resetPasswordValidator
};

