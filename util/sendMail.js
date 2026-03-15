
const nodemailer = require("nodemailer");
const customError = require("./customError");


//setup the nodemailer for send mail

const transporter = nodemailer.createTransport({
    // host: process.env.SMTP_HOST,    // smtp gamil.com
    // port: Number(process.env.SMTP_PORT),    // 587   // i used Number bcause that is string
    // secure: process.env.SMTP_SECURE === "true",
    service:"gmail",
    auth:{
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, 
    },
    
});



// now create a sendemail  async fucntion for send the email and the object parameter

const sendEmail = async ({ to,subject,html})=>{
    
    // Now validation the parameter

    if(!to || !subject || !html ){
        throw new customError("All fildes are require",400);
    };

    try {
         
        // agin a function to send the parameters
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,  //sending email from
            to,
            subject,
            html,
        });

        return info ;

        
    } catch (error) {

        console.error("Email error",error);
        
        throw new customError("Email sending failed",500);
    }
};

module.exports = sendEmail ;
