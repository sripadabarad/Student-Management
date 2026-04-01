const customError = require("../util/customError");
const { generateAccessToken, generateRefreshToken } = require("../util/token");
const User = require("../model/authModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendEmail = require("../util/sendMail");
const crypto = require("crypto");  //for hash the token in reset token
const { access } = require("fs");

// Register Controller

const register = async(data) =>{

     const { name, email, password, role } = data;
    // validation handled by express-validator 

    // Check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
        throw new customError("User already exists", 400);
    }

    // Create new student
    const newUser = new User({
        name,
        email,
        password,
        role
    });

    // Generate tokens (Access + Refresh)
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Hash refresh token and save in DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    newUser.refreshToken = hashedRefreshToken;

    // Save user to DB (password + hashed refresh token)
    await newUser.save();

     return {
        user:newUser,
        accessToken,
        refreshToken
    };
};

// login Controller

const login = async(data) =>{

    const { email, password } = data;

    //validation handled by express - validator

    // Find user

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new customError("Invalid Creadentials", 401);
    }

    //compare the password 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new customError("invalid Password", 401);
    }

    //Gererate Token

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);


    //refreshToken hashed and save in db plain in cookie

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    user.refreshToken = hashedRefreshToken;

    await user.save();

    return {
        user:user,
        accessToken,
        refreshToken
    };
};

// Refresh_Token Controller

const refresh_Token = async(refreshToken) =>{

    if (!refreshToken) {
        throw new customError("refreshToken is not available", 400);
    }

    //verify the Token if token avilable

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
    } catch (error) {
        throw new customError("Invalid refreshtoken or expired", 401);
    }

    //if token expired then check the user from db by ID

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshToken) {
        throw new customError("user not found or refreshtoken missing", 404)
    }

    //if got the token then compare 

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken)
    if (!isMatch) {

        user.refreshToken = null; // DB se refresh token remove
        await user.save();        // DB update

        throw new customError("Session compromised. Please login again", 401);
    }

    //if the token match then create a newAccestoken

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // hash the refreshToken and save in DB

    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

    user.refreshToken = hashedRefreshToken;
    await user.save();

    return {
        user: user,
         newAccessToken,
         newRefreshToken
    };

};

// logOut Controller

const logOut = async(token) =>{
     
     if (!token) {
        throw new customError("Refrehstoken not provided", 400)
    };

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);

    } catch (error) {
        throw new customError("Token invalid or expired", 402);
    };

    const user = await User.findById(decoded.id);

    if (!user) {
        throw new customError("user not found", 400);
    }

    const isMatch = await bcrypt.compare(token, user.refreshToken);
    if (!isMatch) {
        throw new customError("refreshToken not matched", 400);
    }
    user.refreshToken = null;

    await user.save({ validateBeforeSave: false });

    return true;

};

// ChangePassword Controller

const changePassword = async(userId, data) =>{
   
    const { oldPassword, newPassword, confirmPassword } = data;

    // validation handled by express- validation
    //check the new and confirmpasssword match the both

    if (newPassword !== confirmPassword) {
        throw new customError("Passwords do not match", 400)
    }

    //check user login hai ya nai
    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new customError("user not found", 404);
    }

    // check the old password hashed password

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new customError("Old Password is incorrect", 401);
    }
     // ⚡ IMPORTANT: no hashing here (handled by pre-save hook)
    user.password = newPassword;

    // logout from all devices (security Step)
    user.refreshToken = null;
    await user.save();

    return true;
};

// forgotPassword Controller

const forgotPassword = async(data) =>{

    const {email} = data;
    // validation handled by express- validation
    //user check  in databse
    const user = await User.findOne({ email });
    if (!user) {
        throw new customError("User Not found", 404);
    };

    // generate reset token
    const resetToken = user.createResetToken();

    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    //now call the sendmail
    try {

        await sendEmail({
            to: user.email,
            subject: "Reset Password",
            html: `
            <h2>Password Reset</h2>
            <p>Click below to reset your password:</p>
            <a href="${resetLink}">Reset Password</a>
            <p>If you didn't request this, ignore this email.</p>`,
            text:"Reset password email"
        });

        // ✅ ONLY return success status (no res here)
        return true;

    } catch (error) {

        console.error(error.message);

        // rollback token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });
        
        throw new customError("Email send failed", 500)
    }
};

const resetPassword = async(data)=>{
    
    //fronted send the token and by link and send the new password and confirmPassword for reset 
    const {resetToken, newPassword, confirmPassword } = data;

    //validation the input fileds by express- validation
    // match the both password

    if (newPassword !== confirmPassword) {
        throw new customError("Passwords do not match ", 400);
    }

    //if match then hashed the token which comes from the url to check with the hashed dv token 
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //now find user and check the hash token with db hashed token
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new customError("invalid token or expired", 400)
    };
    // pre save in schema so automatically hashed before save in DB
    user.password = newPassword;

    //clear resret token 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Logout all device (security steps)
    user.refreshToken = null;
    await user.save();

    return true;
};


module.exports = {
    register, 
    login, 
    refresh_Token, 
    logOut,
    changePassword, 
    forgotPassword, 
    resetPassword
};