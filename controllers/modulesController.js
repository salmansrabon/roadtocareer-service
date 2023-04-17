const { v4: uuidV4 } = require("uuid");
const { isEmpty } = require("lodash");
const { modules, teachers } = require("../models");
const { validator, customError } = require("../utils");
const { EmptyResultError } = require("sequelize");

// Public Controllers
const getPublicModule = async (req, res) => {
  const filters = req.query;
  const response = await modules.findOne({ ...filters });
  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "Module not found",
    });
  }
  res.status(200).send({
    message: "Module fetched successfully",
    data: response,
  });
};

const getPublicModules = async (req, res) => {
  const filters = req.query || {};
  const response = await modules.findAll({ ...filters });
  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "No Module found",
    });
  }
  res.status(200).send({
    message: "Modules fetched successfully",
    data: response,
  });
};

// Private Controllers
const getModule = async (req, res) => {
  const { id } = req.params;
  const response = await modules.findOne({ id });

  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "Module not found",
    });
  }
  res.status(200).send({
    message: "Module fetched successfully",
    data: response,
  });
};

const getAllModules = async (req, res) => {
  try {
    let filters = req.query ?? {};
    if (req.user.role == "teacher" && filters?.packageId == undefined) {
      const teacher = await teachers.findOne({ id: req.user.id });
      let packageIds = JSON.parse(teacher.courseIds).map((value, index) => value.split("+")[2]);
      // let packageIds = JSON.parse(teacher.courseIds).map((value, index) => value.split("+").pop());
      filters.packageId = packageIds;
      // console.log(packageIds)
      // filters.packageId = packageIds;
    }
    const response = await modules.findAll({ ...filters });

    if (isEmpty(response.rows)) {
      throw customError({
        code: 404,
        message: "No Module found",
      });
    }
    res.status(200).send({
      message: "Modules fetched successfully",
      data: response,
    });
  } catch (err) {
    console.log(err);
    throw customError({
      code: 404,
      message: "CERROR",
    });
  }
};

const addModule = async (req, res) => {
  const availModule = await modules.findOne({ packageId: req.body.packageId });
  if (isEmpty(availModule)) {
    const response = await modules.create({ ...req.body });
    res.status(201).send({
      message: "Module added successfully",
      data: response,
    });
  } else {
    let m = JSON.parse(JSON.parse(availModule.module));
    m.push(...JSON.parse(req.body.module));
    req.body.module = JSON.stringify(m);
    const response = await modules.update(availModule.id, req.body);

    res.status(201).send({
      message: "Module updated successfully",
      data: response,
    });
  }
};

const editModule = async (req, res) => {
  const { id } = req.params;
  const Module = await modules.findOne({ id });

  if (isEmpty(Module)) {
    throw customError({
      code: 404,
      message: "Module not found",
    });
  }

  await modules.update(id, req.body);
  const updatedModule = await modules.findOne({ id });

  res.status(201).send({
    message: "Module updated successfully",
    data: updatedModule,
  });
};

const destroyModule = async (req, res) => {
  const { id } = req.params;
  const Module = await modules.findOne({ id });

  if (isEmpty(Module)) {
    throw customError({
      code: 404,
      message: "Module not found",
    });
  }

  const response = await modules.destroy({ id });
  res.status(201).send({
    message: "Module deleted sucessfully",
  });
};
module.exports = {
  getPublicModule,
  getPublicModules,
  getModule,
  getAllModules,
  addModule,
  editModule,
  destroyModule,
};
