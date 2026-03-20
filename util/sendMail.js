const sgMail = require("@sendgrid/mail");  // sg = sendgrid , Mail = email
const customError = require("../util/customError");

if(!process.env.SENDGRID_API_KEY){
    throw new customError("SENDGRID_API_KEY is not defined",400)
}

//set API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


//reusable fuction

const sendEmail = async({ to , subject, html, text = "" }) => {
    if(!to || !subject || !html){
        throw new customError("Missing required email fields",400)
    }
 
    const msg = {
        to,
        from :process.env.EMAIL_FROM,
        subject,
        html,
        text
    };

    try {
         await sgMail.send(msg);  // yehi send grid use hua 
         return {success: true};
    } catch (error) {
        console.error("SendGrid Error:", error.response?.body || error.message);
        throw new customError("Email sending failed",500);
    }
};


module.exports = sendEmail ;


