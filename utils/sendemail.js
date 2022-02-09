const nodemailer = require("nodemailer");

function sendemail(code, receivermail) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "lalithkasa31dec@gmail.com",
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
  });
}

exports.sendMail = sendemail;
