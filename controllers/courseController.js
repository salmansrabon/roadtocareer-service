const { v4: uuidV4 } = require("uuid");
const { isEmpty } = require("lodash");
const { Course, packages, modules, assignments } = require("../models");
const { validator, customError } = require("../utils");

// Public Controllers
const getPublicCourse = async (req, res) => {
  const filters = req.query;
  const response = await Course.findOne({ ...filters });
  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "Course not found",
    });
  }
  res.status(200).send({
    message: "Course fetched successfully",
    data: response,
  });
};

const getPublicCourses = async (req, res) => {
  const filters = req.query || {};
  const response = await Course.findAll({ ...filters, isEnabled: true });
  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "No course found",
    });
  }
  res.status(200).send({
    message: "Courses fetched successfully",
    data: response,
  });
};

// Private Controllers
const getCourse = async (req, res) => {
  const filters = req.query;
  const response = await Course.findOne({ ...filters });

  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "Course not found",
    });
  }
  res.status(200).send({
    message: "Course fetched successfully",
    data: response,
  });
};

const getAllCourses = async (req, res) => {
  const filters = req.query ?? {};
  const response = await Course.findAll({ ...filters }, ["id", "courseTitle", "batch", "price"]);

  // console.log(response);

  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "No course found",
    });
  }
  res.status(200).send({
    message: "Courses fetched successfully",
    data: response,
  });
};

const addCourse = async (req, res) => {
  validator(req.body, "course");
  const { batch, courseTitle, courseInitial } = req.body;
  const course = await Course.findOne({ batch, courseTitle });
  if (!isEmpty(course))
    throw customError({
      code: 409,
      message: "Course already exists",
    });

  // const id = uuidV4();

  let totalCourse = await Course.findAll({});
  totalCourse = "0" + ((totalCourse?.length || 0) + 1);
  let batch_no = "0" + batch;

  // throw customError({
  //   code: 409,
  //   message: `${totalCourse.rows.length} ${batch_no} hello`,
  // });

  const id = courseInitial + new Date().getFullYear() + batch_no + totalCourse;
  const response = await Course.create({ id, ...req.body });
  res.status(201).send({
    message: "Course added successfully",
    data: response,
  });
};

const editCourse = async (req, res) => {
  validator(req.body, "course");

  const { id } = req.params;
  const course = await Course.findOne({ id });

  if (isEmpty(course)) {
    throw customError({
      code: 404,
      message: "Course not found",
    });
  }

  const response = await Course.update(id, req.body);
  const updatedCourse = await Course.findOne({ id });

  res.status(201).send({
    message: "Course updated successfully",
    data: updatedCourse,
  });
};

const destroyCourse = async (req, res) => {
  const { id } = req.params;
  const course = await Course.findOne({ id });

  if (isEmpty(course)) {
    throw customError({
      code: 404,
      message: "Course not found",
    });
  }

  const response = await Course.destroy({ id });
  const package = await packages.findAll({ courseId: id });
  if (!isEmpty(package)) await packages.destroy({courseId: id});
  const module_s = await modules.findAll({ courseId: id});
  if (!isEmpty(module_s)) modules.destroy({courseId: id});

  res.status(201).send({
    message: "Course deleted sucessfully",
  });
};
module.exports = {
  getPublicCourse,
  getPublicCourses,
  getCourse,
  getAllCourses,
  addCourse,
  editCourse,
  destroyCourse,
};
