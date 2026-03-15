//import ValidationResult from express-validator 

const {validationResult} = require("express-validator");

// middlware function to handle validation errors

const validateRequest = (req,res,next) =>{

    //get all validation error in req and stored in a error variable

    const errors = validationResult(req);  

    if(!errors.isEmpty()){


        const fromattedErrors = errors.array().map(err =>({
            field: err.param,
            message: err.msg
        }));
    } 

    // if error catch then json response

    res.status(400).json({
        success:false,
        message:"validation failed",
        errors:fromattedErrors
    });

    next();  // if no validation error then next to the controller

    };


module.exports = validateRequest ;