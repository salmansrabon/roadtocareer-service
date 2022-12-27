const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { isEmpty } = require("lodash");
const { v4: uuidV4 } = require("uuid");
const { User, Student, Course } = require("../models");
const { validator, customError, mailer, isEmail, randomPassGenerate } = require("../utils");
const variables = require("../variables");
const { EmptyResultError } = require("sequelize");
const { reset } = require("nodemon");

const signUp = async (req, res) => {
  let {
    name,
    university,
    profession,
    experience,
    company,
    city,
    mobile,
    email,
    password = randomPassGenerate(8),
    courseId,
    passingYear,
    package,
    role = "student",
  } = req.body;
  let raw_pass= password;
  email = email.toLowerCase();
  let response = {};
  let id = "";
  if (role !== "admin") {
  validator(req.body, "signup");

    const course = await Course.findOne({ id: courseId });
    if (isEmpty(course)) {
      throw customError({
        code: 400,
        message: "Invalid course ID",
      });
    }

    const student = await Student.findOne({ email, courseId });
    if (!isEmpty(student)) {
      throw customError({
        code: 409,
        message: "Student already enrolled in this course",
      });
    }

    const students = await Student.findAll({ courseId: courseId }, { attributes: ["id"] }, 1, 1, {
      order: [["id", "DESC"]],
    });

    let count = 0;
    if (students.count == 0) {
      count = 1;
    } else {
      count = Number(students.rows[0].id.split("0").pop()) + 1;
    }

    id = course.courseInitial.toUpperCase() + "0" + course.batch + "0" + count;

    password = "";

    response.student = await Student.create({
      id,
      courseId,
      package,
      name,
      university,
      profession,
      experience,
      company,
      city,
      mobile,
      email,
      passingYear,
      batch: course.batch,
      courseTitle: course.courseTitle,
    });

    mailer.sendMail({
      name,
      email,
      courseTitle: course.courseTitle,
      batch: course.batch,
      type: "enroll",
    });
  }
  if (role === "admin") {
    let user = await User.findOne({ email, role });
    if (!isEmpty(user)) {
      throw customError({
        code: 409,
        message: "User already exists",
      });
    }

    let users = await User.findAll({ where: { role: role } });
    let user_count = "0" + ((users?.length || 0) + 1);
    id = role + new Date().getFullYear() + user_count;
    const salt = await bcrypt.genSalt(10);
    // console.log(password)
    password = await bcrypt.hash(password, salt);
  }

  const new_user = await User.create({
    id,
    email,
    password,
    role,
  });
  response.user = {
    id: new_user.id,
    email: new_user.email,
    password:raw_pass,
    role: new_user.role,
  };

  res.status(200).send({
    message: "User signed up successfully",
    data: response,
  });
};

const signIn = async (req, res) => {
  validator(req.body, "signin");
  let user = "";
  let isValid = true;
  if (isEmail(req.body.email.toLowerCase())) {
    user = await User.findOne({ email: req.body.email.toLowerCase(), role:'admin'});
    if (isEmpty(user))
    user = await User.findOne({ email: req.body.email.toLowerCase(), role:'teacher'});

  } else {
    user = await User.findOne({ id: req.body.email.toUpperCase()});
    const student = await Student.findOne({ id: req.body.email.toUpperCase() });
    isValid = (student?.isValid || false) && (student?.isEnrolled || false);
  }
  if (isEmpty(user))
    throw customError({
      code: 404,
      message: "User not found",
    });

  if (!isValid)
    throw customError({
      code: 404,
      message: "Unauthorize access.",
    });

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass)
    throw customError({
      code: 403,
      message: "Wrong password",
    });

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      type: "auth",
    },
    variables.jwtSecret,
    {
      expiresIn: "12h",
    }
  );

  res.status(200).send({
    message: "User signed in successfully",
    token: token,
  });
};

const changePassword = async (req, res) => {
  const id = req.body.id.toUpperCase();
  const reset = req.body?.reset ??false;
  let user = await User.findOne({id});
  if (isEmpty(user)) {
    throw customError({
      code: 403,
      message: "User not found",
    });
  }
  
  const salt = await bcrypt.genSalt(10);
  if(!reset){
    const passMatch =  await bcrypt.compare(req.body.curPassword, user.password);
    if(!passMatch){
      throw customError({
        code: 403,
        message: "Current password is wrong.",
      });
    }
  }
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const response = await User.update(id, { password: hashPassword, pcToken: "" });
  res.status(200).send({
    message: "Changed password successfully",
  });
};

const resetPassword = async (req, res) => {
  const { pcToken } = req.params;
  const decoded = jwt.decode(pcToken, variables.jwtSecret);
  if (!decoded.id) {
    throw customError({
      code: 403,
      message: "Authentication failed",
    });
  }
  let user = await User.findOne({ id: decoded.id });

  if (!user.pcToken || user.pcToken !== pcToken) {
    throw customError({
      code: 403,
      message: "The reset link is wrong.",
    });
  }
  req.body.id = user.id;
  req.body.reset =true;
  let response = await changePassword(req, res).catch((data) => {
    throw customError({
      code: 404,
      message: data,
    });
  });

  res.status(200).send({
    message: "Reset password successfully",
  });
};

const sendResetLink = async (req, res) => {
  const id = req.body.id.toUpperCase();
  let user = await User.findOne({ id: id });

  if (isEmpty(user))
    throw customError({
      code: 403,
      message: "User is not exist.",
    });
  const pcToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      type: "resetToken",
    },
    variables.jwtSecret,
    {
      expiresIn: "12h",
    }
  );

  let response = await User.update(id, { pcToken });

  let student = await Student.findOne({ id: id });

  const { name, email, courseId } = student;

  const course = await Course.findOne({ id: courseId });

  // Send the reset link to the student email address
  mailer.sendMail({
    name,
    email: user.email,
    id,
    courseTitle: course.courseTitle,
    batch: course.batch,
    pcToken: pcToken,
    type: "sendResetLink",
  });
  res.status(200).send({
    message: "Send reset password link successfully.",
  });
};

const isAuthenticPCToken = async (req, res) => {
  const { pcToken } = req.body;

  const user = await User.findOne({ pcToken });
  if (isEmpty(user))
    throw customError({
      code: 403,
      message: "The reset link is wrong.",
    });
  if (!user.pcToken || user.pcToken !== pcToken) {
    throw customError({
      code: 403,
      message: "The reset link is wrong.",
    });
  }
  res.status(200).send({
    message: "reset link is valid.",
  });
};
const isAuthenticated = async (req, res) => {
  res.status(200).send({
    message: "User is authenticated",
  });
};
const destroyUser= async (req, res) => {
  const {id} = req.params;
  const user = await User.findOne({ id });
 
  if (isEmpty(user)) {
    throw customError({
      code: 404,
      message: "User not found",
    });
  }

  const response = await User.destroy({id});
  res.status(201).send({
    message: "User deleted sucessfully",
  });
}
module.exports = {
  signUp,
  signIn,
  changePassword,
  resetPassword,
  sendResetLink,
  isAuthenticated,
  isAuthenticPCToken,
  destroyUser
};
