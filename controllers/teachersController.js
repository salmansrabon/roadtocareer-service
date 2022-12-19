const { v4: uuidV4 } = require("uuid");
const { isEmpty } = require("lodash");
const { teachers } = require("../models");
const { validator, customError } = require("../utils");

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
  const response = await teachers.create({ ...req.body });
  res.status(201).send({
    message: "teacher added successfully",
    data: response,
  });
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
const destroyTeacher= async (req, res) => {
  const {id} = req.params;
  const Teacher = await teachers.findOne({ id });
 
  if (isEmpty(Teacher)) {
    throw customError({
      code: 404,
      message: "Teacher not found",
    });
  }

  const response = await teachers.destroy({id});
  res.status(201).send({
    message: "Teacher deleted sucessfully",
  });
}
module.exports = {
  getPublicTeacher,
  getPublicTeachers,
  getTeacher,
  getAllTeachers,
  addTeacher,
  editTeacher,
  destroyTeacher
};
