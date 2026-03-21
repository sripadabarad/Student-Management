const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("../middleware/asyncHandler");
const customError = require("../util/customError");
const { generateAccessToken, generateRefreshToken } = require("../util/token");
const User = require("../model/authModel");
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
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        },
        accessToken,
    });
});


const login = asyncHandler(async (req, res, next) => {

    //frontend send data

    const { email, password } = req.body;

    //validation 

    if (!email || !password) {
        throw new customError("all fields are required", 400);
    }

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

    // plain refreshtoken set in cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success: true,
        message: "User logged in successfully",
        userInfo: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        accessToken
    });

});


const refresh_Token = asyncHandler(async (req, res, next) => {

    //check token from browser

    const refreshToken = req.cookies.refreshToken;

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

    const user = await Student.findById(decoded.id);
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

    // now sent in the cookie

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success: true,
        message: "newAcess token generate successfully",
        userInfo: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        newAccessToken
    });

});

const logOut = asyncHandler(async (req, res, next) => {

    const token = req.cookies.refreshToken;

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

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });

    res.status(200).json({
        success: true,
        message: "User loggedout successfully",
    });

});

//Change password

const changePassword = asyncHandler(async (req, res, next) => {

    // id ke base pe change hoga na 

    const userId = req.user.id;

    // fronted send this

    const { oldPassword, newPassword, confirmPassword } = req.body;

    //validation

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new customError("All fileds are required", 400);
    }

    //check the new and confirmpasssword match the both

    if (newPassword !== confirmPassword) {
        throw new customError("newPassword and confirmPassword do not match", 400)
    }

    //check user login hai ya nai

    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new customError("user not found", 404);
    }

    // check the old password hashed password

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new customError("oldPassword not match", 401);
    }

    //if old password match then hash the new password and save in db and clear the refrreshtoken from db and cookie

    user.password = newPassword;

    // logged out from all device

    user.refreshToken = null;
    await user.save();

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict"
    })

    res.status(200).json({
        success: true,
        message: "Password changed successfully"
    })

});


//now forgot password 

const forgotPassword = asyncHandler(async (req, res, next) => {

    //fronted send req

    const { email } = req.body;

    // no validation

    if (!email) {
        throw new customError("Email is required", 400);
    }

    //user check  in databse

    const user = await User.findOne({ email });
    if (!user) {
        throw new customError("Student Not found", 404);
    };

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
            <a href="${resetLink}">Reset Password</a>
            <p>Click below to reset your password:</p>
            <p>If you didn't request this, ignore this email.</p>`,
            text:`sripada kumar`
        });

        res.status(200).json({
            success: true,
            message: "Email sent successfully"
            // this one should avoid in production i used to test 
        });

    } catch (error) {

        console.error(error.message);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });
        console.log(resetLink);
        throw new customError("Email send failed", 500)
    }

});


// resetPassword

const resetPassword = asyncHandler(async (req, res, next) => {

    //fronted send the token and by link and send the new password and confirmPassword for reset 

    const { resetToken } = req.params;

    const { newPassword, confirmPassword } = req.body;

    //validation the input fileds

    if (!newPassword || !confirmPassword) {
        throw new customError("All fildes are reuired", 400);
    }

    // match the both password

    if (newPassword !== confirmPassword) {
        throw new customError("password donot match ", 400);
    }

    //if match then hashed the token which comes from the url to check with the hashed dv token 

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //now find use and check the hash token with db sahed hash token
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new customError("invalid token or expired", 400)
    };

    //user mil gaya hash the newPassword

    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(newPassword,salt);

    // save the hashed password in the database

    user.password = newPassword;

    //clear resret token 

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Logout all device

    user.refreshToken = null;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password reset successfully"
    });
});


const getAll = asyncHandler(async (req, res, next) => {

    const name = "sripada";
    res.status(200).json({
        success: true,
        message: "data fetched",
        data: {
            name
        }
    });


});


module.exports = { register, login, refresh_Token, logOut, changePassword, forgotPassword, resetPassword, getAll };