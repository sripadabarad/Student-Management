const customError = require("../util/customError.js");


// authorization is a variavle name
const authorization = (...roles)=>{           //...role matlab enum me jo v array ke andar hai na wo sare roles...
    return (req,res,next)=>{

        const userRole = req.user.role;       // ye req.user.role jwt access token se check kar raha h ki ye sab database mein hai ya nai

        if(!userRole){
            throw new customError("student not logged in",401);     // agar role nai hai to sayad student logged in nai hai
        }

        // Agar user ka role allowed roles me nahi hai → access deny.

        if(!roles.includes(userRole)){
            throw new customError("Access denied: No role defined",403)                 
        }

        //Agar sab sahi → request aage controller tak chala jaye.
        
        next();
    }
};


module.exports = authorization ;