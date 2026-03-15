const express = require("express");
const router = express.Router();

// add all controller data
const 
{ register, 
 login ,
 refresh_Token ,
 logOut ,
 changePassword ,
 forgotPassword ,
 resetPassword,
 getAll } = require("../controller/authController");

 // auth middleware for protected routes

 const authentication = require("../middleware/authentication.js");

 //now RABC for specific person 
 const authorization = require("../middleware/authorization.js");

 // auth validation import and validation error catch middleware
 
 const validateRequest = require("../middleware/validationRequest.js");
 const {
    registerValidator , 
    loginValidator,
    changePasswordValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} = require("../validator/authValidator.js");


 //NOW THE ROUTES END POINTS
 
 //Register
 router.post("/register", registerValidator , validateRequest ,register);

 //login
 router.post("/login",loginValidator,validateRequest,login);

 //refresh_Token
 router.post("/refresh-Token",refresh_Token);

 //logout
 router.post("/logout",authentication,logOut);

 //changepassword
 router.post("/change-password",authentication,changePasswordValidator,validateRequest,changePassword);

 //forgotpassword
 router.post("/forgot-password",forgotPasswordValidator,validateRequest,forgotPassword);

 //resetpassword
 router.post("/reset-password/:resetToken",resetPasswordValidator,validateRequest,resetPassword);

 router.get("/get" ,authentication ,getAll);

 module.exports = router;

