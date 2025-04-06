const nodemailer = require("nodemailer");
require("dotenv").config();


var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

async function sendemail(code, receivermail) {
  console.log("inside sendemail")
  try{
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

async function sendReportEmail(reason,reportedUserName,reportedProfileId,reportedByUserName,reportedByProfileId, receivermail) {
  console.log("inside sendReportEmail")
  const reportedUserNameLink=`${process.env.NODE_JS_URL}/${reportedUserName}/${reportedProfileId}`;
  const reportedByUsernameLink=`${process.env.NODE_JS_URL}/${reportedByUserName}/${reportedByProfileId}`;
  try{
    var mailOptions = {
      to: receivermail,
      subject: `User Report`,
      html:`<b style="color:red">!Important</b> <h3><a href=${reportedUserNameLink}>${reportedUserName}</a> User Reported By <a href=${reportedByUsernameLink}>${reportedByUserName}</a></h3>
         <h2>Reason :${reason}</h2>
         <p>Review the user on priority</p>`
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



module.exports = {sendemail,sendReportEmail};
