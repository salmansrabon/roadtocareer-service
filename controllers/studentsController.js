const generator = require("generate-password");
const bcrypt = require("bcryptjs");
const { isEmpty } = require("lodash");
const { v4: uuidV4 } = require("uuid");
const { signUp } = require("./userController");
const { User, Student, Course, assignments, quizes } = require("../models");
const { customError, randomPassGenerate, mailer } = require("../utils");
const { userController } = require(".");

const getAllStudents = async (req, res) => {
  const filters = req.query ?? {};

  const students = await Student.findAll({ ...filters });

  res.status(200).send({
    message: "Students fetched successfully",
    data: students,
  });
};

const getStudent = async (req, res) => {
  const { id } = req.query;
  const student = await Student.findOne({ id });
  if (isEmpty(student)) {
    throw customError({
      code: 404,
      message: "Student not found",
    });
  }

  res.status(200).send({
    message: "Student fetched successfully",
    data: student,
  });
};

const addStudent = async (req, res) => {
  const response = await signUp(req, res);
  res.status(response.status).send({
    message: response.message,
    data: response.data,
  });
};

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
        let validate = await validateStudent(req, res)
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

  res.status(200).send({
    message: "Student updated" + msg + "successfully",
    data: { ...student, ...resp },
  });
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
const addAttandence = async (req, res) => {
  const { id } = req.params;
  const date = req.body?.date ?? new Date();
  const student = await Student.findOne({ id });
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

  let curDay = date.toLocaleDateString("default", { weekday: "long" });
  console.log(curDay)
  console.log(date.getTime() >= course.orientationDate.getTime())
  if (date.getTime() >= course.orientationDate.getTime() && course.classDays.includes(curDay)) {
    let cTime = new Date();
    let [hour, minute] = JSON.parse(course.classTime).start.split(":");
    cTime.setHours(hour, minute);
    if (date.getTime() >= cTime.getTime() && date.getTime() <= cTime.getTime() + 90 * 60 * 1000) {
      console.log(JSON.parse(student.attendances));
      let attendances = [...(JSON.parse(student.attendances) ?? []), date.getTime()];
      console.log(attendances);
      const response = await Student.update(id, { attendances });

      // console.log(student.attendances)
      res.status(201).send({
        message: "Attenndance has been added successfully.",
      });
    } else {
      throw customError({
        code: 404,
        message: "Ops, you can not add attendance now.",
      });
    }
  } else {
    throw customError({
      code: 404,
      message: "Today is not the class day or orientation still not start.",
    });
  }
};
module.exports = {
  getAllStudents,
  getStudent,
  addStudent,
  updateStudent,
  validateStudent,
  destroyStudent,
  addAttandence,
};
