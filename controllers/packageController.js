const { v4: uuidV4 } = require("uuid");
const { isEmpty } = require("lodash");
const { packages, Course, modules, teachers } = require("../models");
const { validator, customError } = require("../utils");

// Public Controllers
const getPublicPackage = async (req, res) => {
  const filters = req.query;
  const response = await packages.findOne({ ...filters });
  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "Package not found",
    });
  }
  res.status(200).send({
    message: "Package fetched successfully",
    data: response,
  });
};

const getPublicPackages = async (req, res) => {
  const filters = req.query || {};
  const response = await packages.findAll({ ...filters }, (order = req.body?.order || null));
  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "No Package found",
    });
  }
  res.status(200).send({
    message: "Packages fetched successfully",
    data: response,
  });
};

// Private Controllers
const getPackage = async (req, res) => {
  const { id } = req.params;
  const response = await packages.findOne({ id });

  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "Package not found",
    });
  }
  res.status(200).send({
    message: "Package fetched successfully",
    data: response,
  });
};

const getAllPackages = async (req, res) => {
  try {
    let filters = req.query ?? {};
    if (req.user.role == "teacher" && filters?.courseId == undefined) {
      const teacher = await teachers.findOne({ id: req.user.id });
      let courseIds = JSON.parse(teacher.courseIds);
      // let packageIds = JSON.parse(teacher.courseIds).map((value, index) => value.split("+").pop());
      filters.courseId = courseIds;
      // console.log(packageIds)
      // filters.packageId = packageIds;
    }
    const response = await packages.findAll({ ...filters });

    if (isEmpty(response.rows)) {
      throw customError({
        code: 404,
        message: "No Package found",
      });
    }
    res.status(200).send({
      message: "Packages fetched successfully",
      data: response,
    });
  } catch (err) {
    console.log(err);
    throw customError({
      code: 403,
      message: err.message,
    });
  }
};

const addPackage = async (req, res) => {
  const course = await Course.findOne({ id: req.body.courseId });
  // console.log(course);
  const { courseId, packageName } = req.body;
  let package = await packages.findOne({ courseId, packageName });
  if (!isEmpty(package)) {
    throw customError({
      code: 404,
      message: "Package already exists.",
    });
  }
  let price = course.price || "[]";
  price = JSON.parse(price);
  price.push(req.body);

  const response = await packages.create(req.body);
  req.body.id = response.dataValues.id;
  const resp = await Course.update(req.body.courseId, { price });

  res.status(201).send({
    message: "Package added successfully",
    data: response,
  });
};

const editPackage = async (req, res) => {
  const { id } = req.params;
  const Package = await packages.findOne({ id });

  if (isEmpty(Package)) {
    throw customError({
      code: 404,
      message: "Package not found",
    });
  }

  await packages.update(id, req.body);

  let course = await Course.findOne({ id: Package.courseId });
  let price = JSON.parse(course.price);

  let index = price.findIndex((value) => value.id == id);
  price[index] = { ...req.body, id };

  const resp = await Course.update(Package.courseId, { price });

  const updatedPackage = await packages.findOne({ id });

  res.status(201).send({
    message: "package updated successfully",
    data: updatedPackage,
  });
};

const destroyPackage = async (req, res) => {
  const { id } = req.params;
  const Package = await packages.findOne({ id });

  if (isEmpty(Package)) {
    throw customError({
      code: 404,
      message: "Package not found",
    });
  }
  const module_s = await modules.findAll({ packageId: id });
  if (!isEmpty(module_s)) modules.destroy({ packageId: id });
  const response = await packages.destroy({ id });
  res.status(201).send({
    message: "Package deleted sucessfully",
  });
};

module.exports = {
  getPublicPackage,
  getPublicPackages,
  getPackage,
  getAllPackages,
  addPackage,
  editPackage,
  destroyPackage,
};
