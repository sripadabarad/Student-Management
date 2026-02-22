class customError extends Error {
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode ;  //statuscode define kiya jata hai
        this.isOperational = true;     // isOperational is true ka matlab 
    }
};

module.exports = customError;