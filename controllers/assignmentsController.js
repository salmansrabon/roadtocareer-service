const { v4: uuidV4 } = require("uuid");
const { isEmpty } = require("lodash");
const { assignments, Student, packages } = require("../models");
const { validator, customError } = require("../utils");

// Public Controllers
const getPublicAssignment = async (req, res) => {
  const filters = req.query;
  const response = await assignments.findOne({ ...filters });
  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "Assignment not found",
    });
  }
  res.status(200).send({
    message: "Assignment fetched successfully",
    data: response,
  });
};

const getPublicAssignments = async (req, res) => {
  const filters = req.query || {};
  const response = await assignments.findAll({ ...filters });
  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "No Assignment found",
    });
  }
  res.status(200).send({
    message: "assignments fetched successfully",
    data: response,
  });
};

// Private Controllers
const getAssignment = async (req, res) => {
  const { id } = req.params;
  const response = await assignments.findOne({ id });

  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "Assignment not found",
    });
  }
  res.status(200).send({
    message: "Assignment fetched successfully",
    data: response,
  });
};

const getAllAssignments = async (req, res) => {
  let {id, role, ...filters} = req.query;

  if (role == 'student'){
    const student = await Student.findOne({id});
    if (isEmpty(student)) {
      throw customError({
        code: 404,
        message: "Student not found",
      });
    }
    filters.courseId = student.courseId;

    const package = await packages.findOne({courseId: student.courseId, packageName:student.package });
    if (isEmpty(package)) {
      throw customError({
        code: 404,
        message: "Package not found",
      });
    }
    filters.packageId = package.id

  }
  const response = await assignments.findAll({ ...filters });

  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "No Assignment found",
    });
  }
  res.status(200).send({
    message: "assignments fetched successfully",
    data: response,
  });
};

const addAssignment = async (req, res) => {
  const response = await assignments.create({ ...req.body });
  res.status(201).send({
    message: "Assignment added successfully",
    data: response,
  });
};

const editAssignment = async (req, res) => {
  const { id } = req.params;
  const Assignment = await assignments.findOne({ id });

  if (isEmpty(Assignment)) {
    throw customError({
      code: 404,
      message: "Assignment not found",
    });
  }

  await assignments.update(id, req.body);
  const updatedAssignment = await assignments.findOne({ id });

  res.status(201).send({
    message: "Assignment updated successfully",
    data: updatedAssignment,
  });
};

const destroyAssignment = async (req, res) => {
  const {id} = req.params
 
  if (isEmpty(Assignment)) {
    throw customError({
      code: 404,
      message: "Assignment not found",
    });
  }

  const response = await assignments.destroy({id});
  res.status(201).send({
    message: "Assignment deleted sucessfully",
  });
}
module.exports = {
  getPublicAssignment,
  getPublicAssignments,
  getAssignment,
  getAllAssignments,
  addAssignment,
  editAssignment,
  destroyAssignment
};
