const { v4: uuidV4 } = require("uuid");
const bcrypt = require("bcryptjs");
const { isEmpty } = require("lodash");
const { User, teachers } = require("../models");
const { validator, customError, mailer, isEmail, randomPassGenerate } = require("../utils");
const variables = require("../variables");

// Public Controllers
const getPublicTeacher = async (req, res) => {
  const filters = req.query;
  const response = await teachers.findOne({ ...filters });
  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "teacher not found",
    });
  }
  res.status(200).send({
    message: "teacher fetched successfully",
    data: response,
  });
};

const getPublicTeachers = async (req, res) => {
  const filters = req.query || {};
  const response = await teachers.findAll({ ...filters });
  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "No teacher found",
    });
  }
  res.status(200).send({
    message: "teachers fetched successfully",
    data: response,
  });
};

// Private Controllers
const getTeacher = async (req, res) => {
  const { id } = req.params;
  const response = await teachers.findOne({ id });
  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "teacher not found",
    });
  }
  res.status(200).send({
    message: "teacher fetched successfully",
    data: response,
  });
};

const getAllTeachers = async (req, res) => {
  const filters = req.query ?? {};
  const response = await teachers.findAll({ ...filters });

  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "No teacher found",
    });
  }
  res.status(200).send({
    message: "teachers fetched successfully",
    data: response,
  });
};

const addTeacher = async (req, res) => {
  const { name, email, coureIds } = req.body;
  // console.log(req.body);
  const role = "teacher";
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

  req.body.id = id;

  const response = await teachers.create({ ...req.body }).catch((err) => {
    console.log(err);
    throw customError({
      code: 409,
      message: "CC Error",
    });
  });

  try {
    const salt = await bcrypt.genSalt(10);
    // console.log(password)
    const password = randomPassGenerate(8);
    const hashPassword = await bcrypt.hash(password, salt);

    const new_user = await User.create({
      id,
      email,
      password: hashPassword,
      role,
    }).catch((err) => {
      console.log(err);
      throw customError({
        code: 409,
        message: "CC Error",
      });
    });

    const response = {
      user: {
        id: new_user.id,
        email: new_user.email,
        password: password,
        role: new_user.role,
      },
    };

    mailer.sendMail({
      name,
      email,
      userId: id,
      courseIds: JSON.stringify(coureIds),
      password,
      type: "tRegistration",
    });
    res.status(200).send({
      message: "User signed up successfully",
      data: response,
    });
  } catch (err) {
    console.log(err);
    throw customError({
      code: 409,
      message: "CC Error",
    });
  }
};

const editTeacher = async (req, res) => {
  const { id } = req.params;
  const teacher = await teachers.findOne({ id });

  if (isEmpty(teacher)) {
    throw customError({
      code: 404,
      message: "teacher not found",
    });
  }

  await teachers.update(id, req.body);
  const updatedteacher = await teachers.findOne({ id });

  res.status(201).send({
    message: "teacher updated successfully",
    data: updatedteacher,
  });
};
const destroyTeacher = async (req, res) => {
  console.log("authontication done");
  const { id } = req.params;
  const Teacher = await teachers.findOne({ id });
  if (isEmpty(Teacher)) {
    throw customError({
      code: 404,
      message: "Teacher not found",
    });
  }
  const response = await teachers.destroy({ id });
  const responseU = await User.destroy({ id });

  res.status(201).send({
    message: "Teacher deleted sucessfully",
  });
};

const getTeacherSuccessStories = async (req, res) => {
  let filters = req.query ?? {};

  const stories = await teachers.findAll({ ...filters, ssEnable: true }, [
    "name",
    "designation",
    "email",
    "image",
    "university",
    "courseIds",
    "description",
    "facebook", 
    "whatsapp", 
    "linkedin"
  ]);
  res.status(200).send({
    message: "Stories fetched successfully",
    data: stories,
  });
};
const getTeams = async (req, res) => {
  let filters = req.query ?? {};
  const teams = await teachers.findAll({ ...filters, team: true }, [
    "name",
    "designation",
    "email",
    "image",
    "university",
    "courseIds",
    "description",
    "facebook", 
    "whatsapp", 
    "linkedin"
  ]);
  res.status(200).send({
    message: "Teams fetched successfully",
    data: teams,
  });
};
module.exports = {
  getPublicTeacher,
  getPublicTeachers,
  getTeacher,
  getAllTeachers,
  addTeacher,
  editTeacher,
  destroyTeacher,
  getTeacherSuccessStories,
  getTeams 
};
