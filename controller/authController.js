const asyncHandler = require("../middleware/asyncHandler");
const authService = require("../service/auth.service.js");

// ===========================
// Register Controller
// ===========================
const register = asyncHandler(async (req, res) => {

    const { name, email, password, role } = req.body;
    
    const { user, accessToken, refreshToken } = await authService.register({
         name, 
         email, 
         password, 
         role 
        });

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
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        accessToken,

    });
});


const login = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await authService.login({ 
        email, 
        password 
      });
    
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
        accessToken,
        refreshToken
    });

});


const refresh_Token = asyncHandler(async (req, res) => {

     // get refresh token from cookie
    const token = req.cookies.refreshToken;

    if (!token) {
        throw new customError("Refresh token not found", 401);
    }

   const { user, newAccessToken, newRefreshToken } = await authService.refresh_Token(token);
    // now sent in the cookie

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success: true,
        message: "New access token generated successfully",
        userData: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        accessToken : newAccessToken
    });

});


const logOut = asyncHandler(async (req, res) => {

    const token = req.cookies.refreshToken;

     await authService.logOut(token);

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });

    res.status(200).json({
        success: true,
        message: "User logged out successfully",
    });

});

//Change password

const changePassword = asyncHandler(async (req, res) => {

    const userId = req.user.id;

    const {oldPassword , newPassword ,confirmPassword} = req.body;

    await authService.changePassword({ 
        userId, 
        oldPassword , 
        newPassword,
        confirmPassword
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict"
    })

    res.status(200).json({
        success: true,
        message: "Password changed successfully. Please login again."
    })
});

//now forgot password 

const forgotPassword = asyncHandler(async (req, res) => {

    const { email } = req.body;

    await authService.forgotPassword({ email });

    res.status(200).json({
        success: true,
        message: "Email sent successfully"
    });

});

// resetPassword

const resetPassword = asyncHandler(async (req, res) => {
    // client sent plain token and by URL 
    // send the new password and confirmPassword for reset from body 

    const { resetToken } = req.params;

    const { newPassword, confirmPassword } = req.body;

    await authService.resetPassword({
        resetToken, 
        newPassword, 
        confirmPassword 
    });

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