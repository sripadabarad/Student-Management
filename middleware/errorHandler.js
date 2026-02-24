const errorHandler = (err,req,res,next)=>{
    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === "production";


    if(!isProduction){
        console.log(err.stack);
    }

    res.status(statusCode).json({
        success:false,
        message:isProduction && !err.isOperational ? "Something went wrong":err.message
    });
};


module.exports = errorHandler;