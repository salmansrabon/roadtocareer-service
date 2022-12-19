const { createTransport } = require("nodemailer");
const { PASSWORD } = require("../config/db");
const { brand, nodemailerUser, nodemailerPassword, baseURL } = require("../variables");

const transporter = createTransport({
  service:'gmail',
  auth: {
    user: nodemailerUser,
    pass: nodemailerPassword,
  },
});

const mailOptions = (data) => {
  const { name, email, courseTitle, batch, type } = data;
  const options = {
    from: nodemailerUser,
    to: email,
  };

  if (type === "enroll") {
    options.subject = `${brand} enrollment confirmation`;
    options.text = `Dear ${name},\nYou have enrolled successfully for the course of ${courseTitle} at batch ${batch}. We will send you the payment details very soon and contact you regarding payment. Thank you so much again for the enrollment. Stay with Us.\n\nRegards\n${brand}\n01686606909`;
  } else if (type == "sendPass") {
    const { studentId, password } = data;
    options.subject = `${brand} login credentials.`;
    options.html = `Dear ${name},<br/> Thank you so much again for the enrollment in ${courseTitle}. Your user id is <p style='font-weight:bold;'>${studentId}</p> and password is <p style='font-weight:bold;'>${password}</p>.Stay with Us.<br/><br/>Regards<br/>${brand}<br/>01686606909`;
  }
  else if(type =="sendResetLink"){
    const{pcToken} = data;
    options.subject = `${brand} reset link.`;
    options.html = `Dear ${name},<br/>Here you reset link for ${courseTitle}.<a href = "http://${baseURL}/reset-password/${pcToken}">Click here to reset your password</a><br/><br/>Regards<br/>${brand}<br/>01686606909`
  }
  else if(type=="sendPayment"){
    const {installmentNo, installmentAmount, paidAmount, discount, due} = data;
    const dueM = due==0?"You have no due for":`Due amount is ${due} TK for`
    const discountM = discount ==0?"": `Congratulation, you got a discount of ${discout} TK`
    options.subject = `${brand} payment confirmation.`;
    options.html = `Dear ${name},<br/>
          Congratulations!
          <br/>This is to confirm that we have received payment of BDT ৳ ${paidAmount} for the installment no. ${installmentNo} and installment amount is BDT ৳ ${installmentAmount} of ${courseTitle} course at ${brand}.
          <br/><a href = "http://${baseURL}/login">Please login to our website to check your payment details.</a>
          <br/><br/>Stay with Us.\n\nRegards\n${brand}\n01686606909.`
  }
  return options;
};

const sendMail = (params) => {
  console.log("hey goot here")
  const options = mailOptions(params);

  transporter.sendMail(options, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = { sendMail };
