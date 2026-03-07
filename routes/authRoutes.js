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


 //NOW THE ROUTES END POINTS
 
 //Register
 router.post("/register",register);

 //login
 router.post("/login",login);

 //refresh_Token
 router.post("/refresh-Token",refresh_Token);

 //logout
 router.post("/logout",authentication,logOut);

 //changepassword
 router.post("/change-password",authentication ,changePassword);

 //forgotpassword
 router.post("/forgot-password",forgotPassword);

 //resetpassword
 router.post("/reset-password",resetPassword);

 router.get("/get" ,authentication ,getAll);

 module.exports = router;

