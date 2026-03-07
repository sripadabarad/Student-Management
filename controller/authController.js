const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("../middleware/asyncHandler");
const customError = require("../util/customError");
const { generateAccessToken, generateRefreshToken } = require("../util/token");
const Student = require("../model/student");
const sendEmail = require("../util/sendMail");
const crypto = require("crypto");  //for hash the token in reset token

// ===========================
// Register Controller
// ===========================
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !password || !role) {
    throw new customError("All fields are required", 400);
  }

  // Check if user already exists
  const userExist = await Student.findOne({ email });
  if (userExist) {
    throw new customError("User already exists", 400);
  }

  // Create new student
  const newStudent = new Student({
    name,
    email,
    password,
    role,
    refreshToken
  });

  // Generate tokens (Access + Refresh)
  const accessToken = generateAccessToken(newStudent);
  const refreshToken = generateRefreshToken(newStudent);

  // Hash refresh token and save in DB
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  
      newStudent.refreshToken = hashedRefreshToken;

  // Save user to DB (password + hashed refresh token)
  await newStudent.save();

  // Set refresh token cookie for frontend
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 4 * 24 * 60 * 60 * 1000, // 4 days
  });

  // Send response to frontend
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    userData: {
      id: newStudent._id,
      name: newStudent.name,
      email: newStudent.email,
      role: newStudent.role,
    },
    accessToken,
  });
});


const login = asyncHandler(async(req,res,next)=>{

    //frontend send data

    const { email , password } = req.body;

    //validation 

    if(!email || !password){
        throw new customError("all fields are required",400);
    }

    // Find user

    const student = await Student.findOne({email}).select("+password");
    if(!student){
        throw new customError("Invalid Creadentials",401);
    }

    //compare the password 
    const isMatch = await bcrypt.compare(password,student.password);
    if(!isMatch){
        throw new customError("invalid Password",401);
    }

    //Gererate Token

    const accessToken = generateAccessToken(student);
    const refreshToken = generateRefreshToken(student);
    

    //refreshToken hashed and save in db plain in cookie

    const hashedRefreshToken = await bcrypt.hash(refreshToken,10);

    student.refreshToken = hashedRefreshToken;

    await student.save();

    // plain refreshtoken set in cookie
    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success:true,
        message:"User logged in successfully",
        userInfo:{
            id:student._id,
            name:student.name,
            email:student.email,
            role:student.role
        },
        accessToken
    });

});


const refresh_Token = asyncHandler(async(req,res,next)=>{

 //check token from browser

    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        throw new customError("refreshToken is not available",400);
    }

 //verify the Token if token avilable

    let decoded ;

    try {
        decoded = jwt.verify(refreshToken,process.env.JWT_REFRESH_TOKEN);
    } catch (error) {
        throw new customError("Invalid refreshtoken or expired",401);
    }

 //if token expired then check the user from db by ID

    const student = await Student.findById(decoded.id);
    if(!student || !student.refreshToken){
        throw new customError("user not found or refreshtoken missing",404)
    }

 //if got the token then compare 

    const isMatch = await bcrypt.compare(refreshToken,student.refreshToken)
    if(!isMatch){
        
        student.refreshToken = null; // DB se refresh token remove
        await student.save();        // DB update

        throw new customError("Session compromised. Please login again", 401);
    }

 //if the token match then create a newAccestoken

    const newAccessToken = generateAccessToken(student);
    const newRefreshToken = generateRefreshToken(student);

// hash the refreshToken and save in DB

    const hashedRefreshToken = await bcrypt.hash(newRefreshToken,10);

        student.refreshToken = hashedRefreshToken ;
        await student.save();

// now sent in the cookie

    res.cookie("refreshToken",newRefreshToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success:true,
        message:"newAcess token generate successfully",
        userInfo:{
            id:student._id,
            name:student.name,
            email:student.email,
            role:student.role,
        },
        newAccessToken
 });

});

 const logOut = asyncHandler(async(req,res,next)=>{

    const token = req.cookies.refreshToken;

    if(!token){
        throw new customError("Refrehstoken not provided",400)
    };

    let decoded;
    try {
        decoded = jwt.verify(token,process.env.JWT_REFRESH_TOKEN);
       
    } catch (error) {
        throw new customError("Token invalid or expired",402);
    };

    const student = await Student.findById(decoded.id);
    
    if(!student){
        throw new customError("student not found",400);
    }

    const isMatch = await bcrypt.compare(token , student.refreshToken);
    if(!isMatch){
        throw new customError("refreshToken not matched",400);
    }
     student.refreshToken = null;

     await student.save({validateBeforeSave:false});

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });

    res.status(200).json({
        success: true,
        message: "Logout success",
    });

});

//Change password

const changePassword = asyncHandler(async(req,res,next)=>{

    // id ke base pe change hoga na 

    const userId = req.user.id ;

    // fronted send this

const {oldPassword , newPassword , confirmPassword } = req.body;

//validation

if(!oldPassword || !newPassword || !confirmPassword){
    throw new customError("All fileds are required",400);
}

//check the new and confirmpasssword match the both

if( newPassword !== confirmPassword){
    throw new customError("newPassword and confirmPassword do not match",400)
}

//check user login hai ya nai

const student = await Student.findById(userId).select("+password");

if(!student){
    throw new customError("user not found",404);
}

// check the old password hashed password

const isMatch = await bcrypt.compare(oldPassword,student.password);
    if(!isMatch){
        throw new customError("oldPassword not match",401);
    }

//if old password match then hash the new password and save in db and clear the refrreshtoken from db and cookie

const salt = await bcrypt.genSalt(10);

const hashedPassword = await bcrypt.hash(newPassword,salt);

student.password = hashedPassword ;

// logged out from all device

student.refreshToken = null ;
await student.save();

res.clearCookie("refreshToken",{
    httpOnly:true,
    secure:process.env.NODE_ENV === "production",
    sameSite:"Strict"
})

res.status(200).json({
    success:true,
    message:"Password changed successfully"
})

});


//now forgot password 

const forgotPassword = asyncHandler(async(req,res,next)=>{

    //fronted send req

    const { email } = req.body;

    // no validation

    if(!email){
        throw new customError("Email is required",400);
    }

    //user check  in databse

    const student = await Student.findOne({email});
    if(!student){
        throw new customError("Student Not found",404);
    };

    const resetToken = student.createResetToken();

    await student.save({validateBeforeSave:false});

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    //now call the sendmail

    try {

        await sendEmail(
            student.email,
            "Reset Password",
            `<p>
            Click here to reset password:
            <a href="${resetUrl}">Reset</a>
            <br>
            This links expires in 10 minutes
            </p>`
        );

        res.status(200).json({
            success:true,
            message:"Email sent successfully"
        });

    } catch (error) {
        
        console.error(error.message);
        
        student.resetPasswordToken = undefined;
        student.resetPasswordExpire = undefined;

        await student.save({validateBeforeSave:false});
        throw new customError("Email send failed",500)
    }


});


// resetPassword

const resetPassword = asyncHandler(async(req,res,next)=>{

    //fronted send the token and by link and send the new password and confirmPassword for reset 

    const { resetToken } = req.params;

    const {newPassword , confirmPassword} = req.body;

    //validation the input fileds

    if(!newPassword || !confirmPassword){
        throw new customError("All fildes are reuired",400);
    }

    // match the both password

    if(newPassword !== confirmPassword){
        throw new customError("password donot match ",400);
    }

    //if match then hashed the token which comes from the url to check with the hashed dv token 

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //now find use and check the hash token with db sahed hash token
    const student = await Studenttudent.findOne({
        resetPasswordToken:hashedToken,
        resetPasswordExpire:{$gt:Date.now()},
    });

    if(!student){
        throw new customError("invalid token or expired",400)
    };

    //user mil gaya hash the newPassword

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword,salt);

    // save the hashed password in the database

    student.password = hashedPassword;

    //clear resret token 

    student.resetPasswordToken = undefined;
    student.resetPasswordExpire = undefined;

    // Logout all device

    student.refreshToken = null;

    await student.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
        message:"Password reset successfully"
    });
});


const getAll = asyncHandler(async(req,res,next)=>{

    const name = "sripada";
    res.status(200).json({
        success:true,
        message:"data fetched",
        data:{
            name
        }
    });


});


module.exports = { register, login , refresh_Token , logOut , changePassword , forgotPassword , resetPassword,getAll};