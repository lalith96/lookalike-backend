const nodemailer = require("nodemailer");
const dotenv=require('dotenv');

async function sendemail(code, receivermail) {
  console.log("inside sendemail")
  try{
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });
    var mailOptions = {
      to: receivermail,
      subject: "Verification code - lookalike",
      text: `Your verification code is ${code}`,
    };
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    })
  }catch(err){
    console.log(err);
  }
}

module.exports = sendemail;
