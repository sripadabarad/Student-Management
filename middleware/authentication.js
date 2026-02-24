const Student = require("../model/student.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const jwt = require("jsonwebtoken");
const customError = require("../util/customError.js");


// now this is the JWT token verification for the protected routes (ACCESS JWT TOKEN)

//insted of try catch i have used asynchandler for global error catch

const Authentication = asyncHandler(async(req,res,next)=>{

const {authorization} = req.headers ;      // destructuring the req.header which is comes from the headers

if(!authorization || !authorization.startsWith("Bearer ")){
    throw new customError("Authentication required",401)
}

//now split the token from the header & stored into the variable name token

const token = authorization.split(" ")[1];

let decoded;

try {
     decoded = jwt.verify(token,process.env.JWT_ACCESS_TOKEN)   //server check the secret key with the user access  token for authentication
} catch (error) {
    throw new customError("Invalid or Expired Token",401);
}

//now check the student is exist or not in the database

const user = await Student.findById(decoded.id).select("-password");  // always hide sencitive data like : password
        
    if(!user){
        throw new customError("Student not found",404)
    }

    req.user = user ;

    next();
});


module.exports = Authentication ;