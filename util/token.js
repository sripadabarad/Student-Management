const jwt = require("jsonwebtoken");

const generateAccessToken = (user)=>{
    return jwt.sign(
        {id:user._id,role:user.role},
        process.env.JWT_ACCESS_TOKEN,
        {expiresIn:"5m"}
    )
};

const generateRefreshToken = (user)=>{
    return jwt.sign(
    {id:user._id,role:user.role},
    process.env.JWT_REFRESH_TOKEN,
    {expiresIn:"7d"}
    )
};

module.exports = {generateAccessToken,generateRefreshToken};

