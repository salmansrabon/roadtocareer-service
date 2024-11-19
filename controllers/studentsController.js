const generator = require("generate-password");
const bcrypt = require("bcryptjs");
const { isEmpty } = require("lodash");
const { v4: uuidV4 } = require("uuid");
const { signUp } = require("./userController");
const { User, Student, Course, teachers, Payment } = require("../models");
const { customError, randomPassGenerate, mailer } = require("../utils");
const { success } = require("../utils/logger");
const { google } = require("googleapis");
const fs = require("fs");
const moment = require("moment");

const getAllStudents = async (req, res) => {
  let filters = req.query ?? {};

  try {
    let studentsData = [];

    if (req.user.role === "teacher" && !filters.id) {
      const teacher = await teachers.findOne({ id: req.user.id });

      const courseIds = JSON.parse(teacher.courseIds);
      filters.courseId = courseIds;
    }

    // Fetch students based on the filters
    const students = await Student.findAll({ ...filters });
    // console.log(students);

    // Fetch payment details for each student
    const studentInstances = students.rows;

    // Fetch payment details for each student
    const studentsWithPayments = await Promise.all(
      studentInstances.map(async (student) => {
        const payments = await Payment.findAll({ studentId: student.id });
        return {
          ...student.dataValues, // Use .dataValues to extract raw object
          payments: payments,
        };
      })
    );

    res.status(200).send({
      message: "Students fetched successfully",
      data: studentsWithPayments,
    });
  } catch (err) {
    console.log(err);
    throw customError({
      code: 404,
      message: "CERROR",
    });
  }
};

const getStudent = async (req, res) => {
  const { id } = req.query;
  const student = await Student.findOne({ id });
  const date = new Date();
  if (isEmpty(student)) {
    throw customError({
      code: 404,
      message: "Student not found",
    });
  }
  req.params.id = id;
  req.body.date = date;
  let checkValidDate = false;
  let message = "";
  const checkDate = await checkAttendanceDate(req, res)
    .then(async (data) => {
      checkValidDate = data.state;
      message = data.message;
      // console.log(data)
    })
    .catch((err) => console.log("Error Occured."));
  res.status(200).send({
    message: "Student fetched successfully",
    data: { ...student.dataValues, checkValidDate, message },
  });
};

const addStudent = async (req, res) => {
  const response = await signUp(req, res);
  res.status(response.status).send({
    message: response.message,
    data: response.data,
  });
};

// const updateStudent = async (req, res) => {
//   const { studentId } = req.params;
//   let msg = " ";
//   let resp = {};
//   if (req.body.isValid) {
//     const st = await Student.findOne({ id: studentId });
//     if (isEmpty(st)) {
//       throw customError({
//         status: 404,
//         message: "Student not found",
//       });
//     }
//     if (!st.isValid) {
//       const user = await User.findOne({ id: studentId });
//       if (!user.password) {
//         let validate = await validateStudent(req, res)
//           .then((payload) => {
//             resp = payload.data;
//           })
//           .catch((data) => {
//             throw customError({
//               code: 404,
//               message: data.message,
//             });
//           });

//         msg = " and validated ";
//       }
//     }
//   }
//   const student = await Student.update(studentId, req.body);
//   if (req.body?.email) {
//     await User.update(studentId, { email: req.body.email });
//   }
//   res.status(200).send({
//     message: "Student updated" + msg + "successfully",
//     data: { ...student, ...resp },
//   });
// };

const updateStudent = async (req, res) => {
  const { studentId } = req.params;
  let msg = " ";
  let resp = {};
  if (req.body.isValid) {
    const st = await Student.findOne({ id: studentId });
    if (isEmpty(st)) {
      throw customError({
        status: 404,
        message: "Student not found",
      });
    }
    if (!st.isValid) {
      const user = await User.findOne({ id: studentId });
      if (!user.password) {
        let validate = await validateStudent2(req, res)
          .then((payload) => {
            resp = payload.data;
          })
          .catch((data) => {
            throw customError({
              code: 404,
              message: data.message,
            });
          });

        msg = " and validated ";
      }
    }
  }
  const student = await Student.update(studentId, req.body);
  if (req.body?.email) {
    await User.update(studentId, { email: req.body.email });
  }
  res.status(200).send({
    message: "Student updated" + msg + "successfully",
    data: { ...student, ...resp },
  });
};

const validateStudent2 = async (req, res) => {
  const { studentId } = req.params;
  const { name, courseId, email, isValid } = req.body;

  const password = randomPassGenerate(8);
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  await Student.update(studentId, { isValid });
  // console.log("i am updating pass");
  await User.update(studentId, { password: hashPassword });
  // console.log("finding course");
  const course = await Course.findOne({ id: courseId });
  if (isEmpty(course)) {
    // throw customError({
    //   code: 404,
    //   message: "Course Not Found!",
    // });
    return {
      code: 404,
      message: "Course Not Found!",
    };
  }
  console.log("Sending mail........");
  // Send the password to the student email address
  await mailer.sendMail({
    name,
    email,
    studentId,
    password,
    courseTitle: course.courseTitle,
    batch: course.batch,
    type: "sendPass",
  });

  // res.status(200).send({
  //   message: "Student validated successfully",
  //   data: { name, email, studentId, password },
  // });
  return {
    message: "Student validated successfully",
    data: { name, email, studentId, password },
  };
};

const validateStudent = async (req, res) => {
  const { studentId } = req.params;
  const { name, courseId, email, isValid } = req.body;

  const password = randomPassGenerate(8);
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  await Student.update(studentId, { isValid });
  await User.update(studentId, { password: hashPassword });
  const course = await Course.findOne({ id: courseId });
  if (isEmpty(course)) {
    throw customError({
      code: 404,
      message: "Course Not Found!",
    });
  }

  // Send the password to the student email address
  mailer.sendMail({
    name,
    email,
    studentId,
    password,
    courseTitle: course.courseTitle,
    batch: course.batch,
    type: "sendPass",
  });

  res.status(200).send({
    message: "Student validated successfully",
    data: { name, email, studentId, password },
  });
};

const disableAceess = async (req, res) => {
  try {
    const { studentIds } = req.body;
    // console.log(studentIds);
    await Student.update(studentIds, { isValid: false })
      .then((result) => {
        res
          .status(201)
          .send({ message: "All of the unpaid students access rebooked successfully" });
      })
      .catch((err) => {
        throw customError({
          code: 404,
          message: "Database error",
        });
      });
  } catch (err) {
    console.log(err);
    throw customError({
      code: 404,
      message: "CError",
    });
  }
};

const destroyStudent = async (req, res) => {
  const { id } = req.params;
  const student = await Student.findOne({ id });

  if (isEmpty(student)) {
    throw customError({
      code: 404,
      message: "Student not found",
    });
  }
  const response = await Student.destroy({ id });
  const responseU = await User.destroy({ id });
  res.status(201).send({
    message: "Student deleted sucessfully",
  });
};
const checkAttendanceDate = async (req, res) => {
  const { id } = req.params;
  const date = new Date();
  const student = req.body?.student ?? (await Student.findOne({ id }));
  if (isEmpty(student)) {
    throw customError({
      code: 404,
      message: "Student not found",
    });
  }
  const course = await Course.findOne({ id: student.courseId });
  if (isEmpty(course)) {
    throw customError({
      code: 404,
      message: "Course Not Found!",
    });
  }
  let attendances = JSON.parse(student?.attendances ?? []);
  let curDay = date.toLocaleDateString("default", { weekday: "long" });
  // console.log(curDay)
  // console.log(date.getTime() >= course.orientationDate.getTime())
  if (date.getTime() >= course.orientationDate.getTime() && course.classDays.includes(curDay)) {
    let cTime = new Date();
    let [hour, minute] = JSON.parse(course.classTime).start.split(":");
    cTime.setHours(hour, minute);
    if (date.getDate() == new Date(attendances[attendances.length - 1] ?? 500).getDate()) {
      return {
        message: "You have already given the attendance.",
        state: false,
      };
    } else if (
      date.getTime() >= cTime.getTime() &&
      date.getTime() <= cTime.getTime() + 150 * 60 * 1000
    ) {
      // console.log(JSON.parse(student.attendances));
      return {
        message: "Attenndance has been added successfully.",
        state: true,
      };
    } else {
      return {
        message: "Ops, you can not add attendance now.",
        state: false,
      };
    }
  } else {
    return {
      message: "Today is not the class day or orientation still not start.",
      state: false,
    };
  }
};
const addAttandence = async (req, res) => {
  const { id } = req.params;
  const date = new Date();
  const student = await Student.findOne({ id });
  if (isEmpty(student)) {
    throw customError({
      code: 404,
      message: "Student not found",
    });
  }

  req.body.student = student;

  const checkDate = await checkAttendanceDate(req, res)
    .then(async (data) => {
      // console.log(data);
      if (data.state) {
        let attendances = [...(JSON.parse(student.attendances) ?? []), date.getTime()];
        // console.log(attendances);
        const response = await Student.update(id, { attendances })
          .then((payload) => {
            res.status(201).send({
              data: {
                message: "Attenndance has been added successfully.",
                state: true,
              },
            });
          })
          .catch((err) => console.log(err));

        // console.log(student.attendances)
      } else {
        res.status(403).send({
          data: {
            message: data.message,
            state: false,
          },
        });
      }
    })
    .catch((err) => {
      console.log(err);
      throw customError({
        code: 404,
        message: "Sorry! Error occured..",
      });
    });
};

const addAttandence_Admin = async (req, res) => {
  const { id } = req.params;
  const dateString = req.body?.date;

  // Parse the date using moment.js
  const date = dateString ? moment(dateString, "DD/MM/YYYY h:mm a") : moment();

  const student = await Student.findOne({ id });
  if (isEmpty(student)) {
    throw customError({
      code: 404,
      message: "Student not found",
    });
  }

  req.body.student = student;

  let attendances = JSON.parse(student.attendances) ?? [];

  // Check if attendance already exists for the given date
  if (attendances.some((attendanceDate) => isSameDay(moment(attendanceDate), date))) {
    throw customError({
      code: 400,
      message: "Attendance already recorded for this date",
    });
  }

  // If not, add the new attendance
  attendances.push(date.toDate().getTime());

  // Update the database with the modified attendance array
  await Student.update(id, { attendances });

  res.status(201).send({
    data: {
      message: "Attendance has been added successfully.",
      state: true,
    },
  });
};
function isSameDay(date1, date2) {
  return date1.isSame(date2, "day");
}
const addQuizAnswer = async (req, res) => {
  const { id } = req.params;
  const student = await Student.findOne({ id });
  if (isEmpty(student)) {
    throw customError({
      code: 404,
      message: "Student not found",
    });
  }
};

const getStudentSuccessStories = async (req, res) => {
  let filters = req.query ?? {};
  const stories = await Student.findAll({ ...filters, ssEnable: true }, [
    "name",
    "email",
    "image",
    "university",
    "profession",
    "courseId",
    "courseTitle",
    "package",
    "batch",
    "facebook",
    "whatsapp",
    "linkedin",
    "designation",
    "successStory",
  ]);
  res.status(200).send({
    message: "Stories fetched successfully",
    data: stories,
  });
};

const generateDriveAccessToken = (req, res) => {
  const serviceAccountData = {
    type: process.env.type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: process.env.private_key.replace(/\\n/g, "\n"),
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url,
    universe_domain: process.env.universe_domain,
  };

  const jsonData = JSON.stringify(serviceAccountData, null, 2);
  fs.writeFileSync("service-account.json", jsonData);
  const serviceAccount = require("../service-account.json");

  const jwtClient = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  jwtClient.authorize((err, tokens) => {
    if (err) {
      console.error("Error in authorization:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({
      message: "Access token generated successfully",
      token: tokens.access_token,
    });
  });
};

module.exports = {
  getAllStudents,
  getStudent,
  addStudent,
  updateStudent,
  validateStudent,
  disableAceess,
  destroyStudent,
  addAttandence,
  checkAttendanceDate,
  addAttandence_Admin,
  getStudentSuccessStories,
  generateDriveAccessToken,
};
