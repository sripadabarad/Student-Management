const sgMail = require("@sendgrid/mail");  // sg = sendgrid , Mail = email

//set API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


//reusable fuction

const sendEmail = async({ to , subject, html}) => {
 
    const msg = {
        to,
        from :process.env.EMAIL_FROM,
        subject,
        html,
    };

    await sgMail.send(msg);  // yehi send grid use hua 

};


module.exports = sendEmail ;


