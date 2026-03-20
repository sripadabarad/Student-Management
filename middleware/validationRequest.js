
const {validationResult} = require("express-validator");

const validateRequest = (req,res,next) =>{

    //get all validation error in req and stored in a error variable

    const errors = validationResult(req);  

    if (!errors.isEmpty()) {

    const formattedErrors = errors.array().map(err =>({
            field: err.path,
            message: err.msg
        }));

  // if error catch then json response        
       res.status(400).json({
        success:false,
        message:"validation failed",
        errors:formattedErrors
    });

    } 
    next();  // if no validation error then next to the controller

    };


module.exports = validateRequest ;



// const { validationResult } = require("express-validator");

// const validateRequest = (req, res, next) => {
    
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {

//         const formattedErrors = errors.array().map(err => ({
//             field: err.path,
//             message: err.msg
//         }));

//         return res.status(400).json({
//             success: false,
//             message: "Validation failed",
//             errors: formattedErrors
//         });
//     }

//     next();
// };

// module.exports = validateRequest;