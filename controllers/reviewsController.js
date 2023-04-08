const { v4: uuidV4 } = require("uuid");
const { isEmpty } = require("lodash");
const { reviews } = require("../models");
const { validator, customError } = require("../utils");

// Public Controllers
const getPublicReview = async (req, res) => {
  const filters = req.query;
  const response = await reviews.findOne({ ...filters });
  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "Reviews not found",
    });
  }
  res.status(200).send({
    message: "Reviews fetched successfully",
    data: response,
  });
};

const getPublicReviews = async (req, res) => {
  const filters = req.query || {};
  const response = await reviews.findAll({ ...filters });
  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "No reviews found",
    });
  }
  res.status(200).send({
    message: "Reviews fetched successfully",
    data: response,
  });
};

// Private Controllers
const getReview = async (req, res) => {
  const { id } = req.params;
  const response = await reviews.findOne({ id });

  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "Reviews  not found",
    });
  }
  res.status(200).send({
    message: "Reviews fetched successfully",
    data: response,
  });
};

const getAllReviews = async (req, res) => {
  const filters = req.query ?? {};
  const response = await reviews.findAll({ ...filters });

  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "No Reviews found",
    });
  }
  res.status(200).send({
    message: "Reviews fetched successfully",
    data: response,
  });
};

const addReview = async (req, res) => {
  //   const availReviews = await reviews.findOne({id:req.id})
  //   if(isEmpty(availReviews)){

  const response = await reviews.create({ ...req.body });
  res.status(201).send({
    message: "Reviews added successfully",
    data: response,
  });
};

const editReview = async (req, res) => {
  const { id } = req.params;
  const Reviews = await reviews.findOne({ id });

  if (isEmpty(Reviews)) {
    throw customError({
      code: 404,
      message: "Reviews not found",
    });
  }

  await reviews.update(id, req.body);
  const updatedReviews = await reviews.findOne({ id });

  res.status(201).send({
    message: "Reviews updated successfully",
    data: updatedReviews,
  });
};

const destroyReview = async (req, res) => {
  const { id } = req.params;
  const Reviews = await reviews.findOne({ id });

  if (isEmpty(Reviews)) {
    throw customError({
      code: 404,
      message: "Reviews not found",
    });
  }

  const response = await reviews.destroy({ id });
  res.status(201).send({
    message: "Reviews deleted sucessfully",
  });
};
module.exports = {
  getPublicReview,
  getPublicReviews,
  getReview,
  getAllReviews,
  addReview,
  editReview,
  destroyReview,
};
