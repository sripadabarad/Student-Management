const mongoose = require("mongoose");   // import mongoose for schema creation

const crypto = require("crypto"); //use for hash the resetpassword token and reset the password
const bcrypt = require("bcrypt");   //called bcrypt to hash the password for secure authentication

//now create the user model design

const studentSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:[true,"Name is required"],
    },
    email:{
        type:String,
        unique:true,
        required:[true,"Email  is required"],
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:[true,"password required"],
        minlength:[6,"password  must be at least 6 character "],
        select:false   // whwen user find the data then passsword should be can't return bcz its a sensitive data
    },
    role:{
        type:String,
        enum:["admin","teacher","student"],
        default:"student"
    },
    refreshToken:{
        type:String
    },
    resetPasswordToken:{type:String},
    resetPasswordExpire:{type:Date}
},{timestamps:true});


//hash the password

studentSchema.pre("save", async function (next) {
    if(!this.isModified("password"))         // if password not change then call next and save this into  the database
        return next();
        
  //if the password changed then hashed the password and do next to save the hashed in database

  const salt = await bcrypt.genSalt(10);   // salt is variable and i used await bcz its a asyn function and the genSalt 10 is a rantom bytes 
    this.password =  await bcrypt.hash(this.password , salt)   // which is hash the  the password 
    next();
});



// while login compare the plain password with the hashed password 

studentSchema.methods.comparePassword = async function (inputPasswod) {
    return await bcrypt.compare(inputPasswod , this.password);
};

//now use crypto for fortgot password 

studentSchema.methods.createResetToken = function (){

    const resetToken = crypto.randomBytes(30).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 10 * 60 *  1000 ;
    
    return resetToken ;
};

const Student = mongoose.model("Student",studentSchema);

module.exports = Student;