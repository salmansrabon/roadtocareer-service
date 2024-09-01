const { createTransport } = require("nodemailer");
const { brand, nodemailerUser, nodemailerPassword, resetURL, nodemailerPort, nodemailerHost } = require("../variables");
const { Sequelize, QueryTypes } = require("sequelize");
const { DB, USER, PASSWORD, HOST, dialect, pool } = require("../config/db");

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
    const { installmentNo, paidAmount, discount, due } = data;
    options.subject = `${brand} payment confirmation.`;
    options.html = `Dear ${name},<br>We have received your payment of BDT ৳ ${paidAmount} for the installment no.${installmentNo} .<br>Please login to our <a href="https://www.roadtocareer.net" rel="noopener noreferrer" target="_blank">website </a>to check your payment details.
    <p>Regards<br>${brand}<br>Whatsapp: 01686606909<br>Fb Group: <a data-fr-linked="true" href="https://www.facebook.com/groups/roadtosdet">https://www.facebook.com/groups/roadtosdet</a></p>`
  }
  else if (type == "tRegistration") {
    const { name, password, userId } = data;
    options.subject = `${brand} Teacher registration successfull.`;
    options.html = `Dear ${name},<br>Welcome to our family. Here is your login credintial:<br>Email: ${email}<br>User Id: ${userId}<br>password: ${password}<br>Please check the following links:<br>Whatsapp: 01686606909<br>Fb Group: https://www.facebook.com/groups/roadtosdet`;

  }
  return options;
};

const sendMail =async (params) => {

  let emails = null;
  let adminOptions = {}; // Declare adminOptions here

  try {
    const sequelize = new Sequelize(DB, USER, PASSWORD, {
      host: HOST,
      dialect: dialect,
      operatorsAliases: '0',
      pool: {
        max: pool.max,
        min: pool.min,
        acquire: pool.acquire,
        idle: pool.idle,
      },
    });
    if (params.type === "enroll") {
      const adminQuery = `
    SELECT email
    FROM users
    WHERE role = 'admin';
  `;
      sequelize.query(adminQuery, {
        type: QueryTypes.SELECT,
      })
        .then(results => {
          console.log(results);
          emails = results;

          const options = mailOptions(params);

          transporter.sendMail(options, (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });

          // Construct adminOptions separately
          const adminEmails = emails.map(obj => obj.email);
          const adminSubject = "A new student is enrolled.";
          const adminHTML = `
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

          // Sending separate emails to each admin email address
          adminEmails.forEach(adminEmail => {
            const adminMailOptions = {
              from: nodemailerUser,
              to: adminEmail,
              subject: adminSubject,
              html: adminHTML,
            };

            transporter.sendMail(adminMailOptions, (error, info) => {
              if (error) {
                console.log(error);
              } else {
                console.log(`Admin Email sent to ${adminEmail}: ` + info.response);
              }
            });
          });
        })
        .catch(error => {
          console.error(error);
          return;
        })
        .finally(() => {
          sequelize.close();
        });

    }
    else if (params.type === "sendPayment") {
      const adminQuery = `
        SELECT email
        FROM users
        WHERE role = 'admin';
      `;
  
      try {
        sequelize.query(adminQuery, {
          type: QueryTypes.SELECT,
        })
          .then(results => {
            console.log(results);
            const adminEmails = results.map(obj => obj.email);
  
            // Logic for sending payment confirmation email to the student
            const studentOptions = mailOptions(params);
            transporter.sendMail(studentOptions, (error, info) => {
              if (error) {
                console.log(error);
              } else {
                console.log("Student Payment Confirmation Email sent: " + info.response);
              }
            });
  
            // Logic for sending payment confirmation email to each admin
            const adminSubject = `${brand} New Payment Added`;
            const adminHTML = `
              <h2>New Payment Added</h2>
              <p>A new payment has been received:</p>
              <ul>
                <li><strong>Name:</strong> ${params.name}</li>
                <li><strong>Email:</strong> ${params.email}</li>
                <li><strong>Installment No:</strong> ${params.installmentNo}</li>
                <li><strong>Paid Amount:</strong> BDT ${params.paidAmount}</li>
              </ul>
            `;
  
            adminEmails.forEach(adminEmail => {
              const adminMailOptions = {
                from: nodemailerUser,
                to: adminEmail,
                subject: adminSubject,
                html: adminHTML,
              };
  
              transporter.sendMail(adminMailOptions, (error, info) => {
                if (error) {
                  console.log(error);
                } else {
                  console.log(`Admin Email sent to ${adminEmail}: ` + info.response);
                }
              });
            });
          })
          .catch(error => {
            console.error(error);
            return;
          });
      } catch (error) {
        console.log(error);
      }
    }
    else if (params.type === "sendPass") {
      console.log(params.type)
      console.log("Entered 'sendPass' block"); // Add this line
      // Logic for sending password email to student
      try {
        const studentOptions = mailOptions(params);
        console.log("Student Options:", studentOptions); // Log the studentOptions object
        const info = await transporter.sendMail(studentOptions);
        console.log("Student Password Email sent: " + info.response);
      } catch (error) {
        console.log("Error sending student password email:", error);
        const studentOptions = mailOptions(params);
        console.log("Student Options:", studentOptions); // Log the studentOptions object
        const info = await transporter.sendMail(studentOptions);
        console.log("Student Password Email sent: " + info.response);
      }
    } 
    else if (params.type === "sendResetLink") {
      // Logic for sending reset link email to student
      const studentOptions = mailOptions(params);
      transporter.sendMail(studentOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Student Reset Link Email sent: " + info.response);
        }
      });
    } else if (params.type === "tRegistration") {
      // Logic for sending teacher registration email to student
      const studentOptions = mailOptions(params);
      transporter.sendMail(studentOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Teacher Registration Email sent: " + info.response);
        }
      });
    }
  }
  catch (error) {
    console.log(error)
  }
  console.log(adminOptions);
};

module.exports = { sendMail };
