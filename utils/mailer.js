const { createTransport } = require("nodemailer");
const { PASSWORD } = require("../config/db");
const { brand, nodemailerUser, nodemailerPassword, resetURL, nodemailerPort, nodemailerHost } = require("../variables");

//mailer config
const transporter = createTransport({
  host: nodemailerHost,
  port: nodemailerPort,
  secure: false,
  secureConnection: false,
  auth: {
    user: nodemailerUser,
    pass: nodemailerPassword

  },
  tls: {
    rejectUnAuthorized: true
  }
});

// const transporter = createTransport({
//   service:'gmail',
//   auth: {
//     user: nodemailerUser,
//     pass: nodemailerPassword,
//   },
// });

const mailOptions = (data) => {
  const { name, email, courseTitle, batch, type } = data;
  const options = {
    from: nodemailerUser,
    to: email,
  };

  if (type === "enroll") {
    options.subject = `${brand} enrollment confirmation`;
    options.html = `Dear ${name},<br>You have enrolled successfully for the course of ${courseTitle} at batch ${batch}. We will send you the payment details very soon and contact you regarding payment.&nbsp;<br><br>Stay with Us.<br>Regards<br>${brand}<br>Whatsapp: 01686606909<br>Fb Group: https://www.facebook.com/groups/roadtosdet`;
  } else if (type == "sendPass") {
    const { studentId, password } = data;
    options.subject = `${brand} login credentials.`;
    options.html = `Dear ${name},<br>Thank you so much for completing the enrollment in ${courseTitle}.&nbsp;<br>Your user id is <strong>${studentId}</strong> and password is&nbsp;<strong>${password}</strong>.<br>Click <a href="https://www.roadtocareer.net/login" rel="noopener noreferrer" target="_blank">here for login</a>.<br><br>Regards<br>${brand}<br>Whatsapp: 01686606909<br>Fb Group: https://www.facebook.com/groups/roadtosdet`;
  }
  else if (type == "sendResetLink") {
    const { pcToken } = data;
    options.subject = `${brand} reset link.`;
    options.html = `Dear ${name},<br/>Here is your reset link for ${courseTitle}.<a href = "${resetURL}/reset-password/${pcToken}">Click here to reset your password</a><br><br>Regards<br>${brand}<br>Whatsapp: 01686606909<br>Fb Group: https://www.facebook.com/groups/roadtosdet`
  }
  else if (type == "sendPayment") {
    const { installmentNo, installmentAmount, paidAmount, discount, due } = data;
    const dueM = due == 0 ? "You have no due for" : `Due amount is ${due} TK for`
    const discountM = discount == 0 ? "" : `Congratulation, you got a discount of ${discount} TK`
    options.subject = `${brand} payment confirmation.`;
    options.html = `Dear ${name},<br>We have received your payment of BDT ৳ ${paidAmount} for the installment no.${installmentNo} .<br>Please login to our <a href="https://www.roadtocareer.net" rel="noopener noreferrer" target="_blank">website </a>to check your payment details.
    <p>Regards<br>${brand}<br>Whatsapp: 01686606909<br>Fb Group: <a data-fr-linked="true" href="https://www.facebook.com/groups/roadtosdet">https://www.facebook.com/groups/roadtosdet</a></p>`
  }
  else if(type == "tRegistration"){
    const {name, courseIds, password, userId} = data;
    options.subject = `${brand} Teacher registration successfull.`;
    options.html = `Dear ${name},<br>Welcome to our family. Here is your login credintial:<br>Email: ${email}<br>User Id: ${userId}<br>password: ${password}<br>Please check the following links:<br>Whatsapp: 01686606909<br>Fb Group: https://www.facebook.com/groups/roadtosdet`;
  
  }
  return options;
};

const sendMail = (params) => {
  const options = mailOptions(params);

  const adminOptions = { ...options };

  transporter.sendMail(options, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  adminOptions.to = "roadtosdet@gmail.com";
  adminOptions.subject = "A new student is enrolled.";
  adminOptions.html = `
  <h2>A new student is enrolled</h2>
  <ul>
      <li><strong>Name:</strong> ${params.name}</li>
      <li><strong>Email:</strong> ${params.email}</li>
      <li><strong>Phone Number:</strong> ${params.mobile}</li>
      <li><strong>University:</strong> ${params.university}</li>
      <li><strong>Company Name:</strong> ${params.company || 'N/A'}</li>
      <li><strong>Passing Year:</strong> ${params.passingYear}</li>
  </ul>
`;

  transporter.sendMail(adminOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Admin Email sent: " + info.response);
    }
  });
};
module.exports = { sendMail };
