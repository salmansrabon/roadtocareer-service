const { customError } = require("../utils");
const { findOne, findAll, create, update, destroy } = require("./../models/RecordedVideoModel");


const getRecordedVideosByCourseId = async (req, res) => {
  const { courseId } = req.params;
  const { classType } = req.query;
  const filters = { courseId };

  if (classType) {
    filters.classType = classType;
  }

  const response = await findAll(filters);

  if (response.count === 0) {
    throw customError({
      code: 404,
      message: "No recorded videos found for the given courseId",
    });
  }

  res.status(200).send({
    message: "Recorded videos fetched successfully",
    count: response.count,
    data: response.rows,
  });
};

const getPublicRecordedVideo = async (req, res) => {
  const filters = req.query;
  const response = await findOne(filters);
  if (!response) {
    throw customError({
      code: 404,
      message: "Recorded video not found",
    });
  }
  res.status(200).send({
    message: "Recorded video fetched successfully",
    data: response,
  });
};

const getPublicRecordedVideos = async (req, res) => {
  const filters = req.query || {};
  const response = await findAll();

  if (response.count === 0) {
    throw customError({
      code: 404,
      message: "No recorded videos found",
    });
  }
  res.status(200).send({
    message: "Recorded videos fetched successfully",
    count: response.count,
    data: response.rows,
  });
};


const getRecordedVideo = async (req, res) => {
  const { id } = req.params;
  const response = await findOne({ id });

  if (!response) {
    throw customError({
      code: 404,
      message: "Recorded video not found",
    });
  }
  res.status(200).send({
    message: "Recorded video fetched successfully",
    data: response,
  });
};

const getAllRecordedVideos = async (req, res) => {
  const filters = req.query || {};
  const response = await findAll(filters);

  if (response.count === 0) {
    throw customError({
      code: 404,
      message: "No recorded videos found",
    });
  }

  res.status(200).send({
    message: "Recorded videos fetched successfully",
    count: response.count,
    data: response.rows,
  });
};


const addRecordedVideo = async (req, res) => {
  const response = await create({ ...req.body });
  res.status(201).send({
    message: "Recorded video added successfully",
    data: response,
  });
};

const editRecordedVideo = async (req, res) => {
  const { id } = req.params;
  const recordedVideo = await findOne({ id });

  if (!recordedVideo) {
    throw customError({
      code: 404,
      message: "Recorded video not found",
    });
  }

  await update(id, req.body);
  const updatedRecordedVideo = await findOne({ id });

  res.status(200).send({
    message: "Recorded video updated successfully",
    data: updatedRecordedVideo,
  });
};

const destroyRecordedVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const recordedVideo = await findOne({ id });

    if (!recordedVideo) {
      throw customError({
        code: 404,
        message: "Recorded video not found",
      });
    }

    await destroy({ id });
    res.status(200).send({
      message: "Recorded video deleted successfully",
    });
  } catch (err) {
    throw customError({
      code: 500,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getRecordedVideosByCourseId,
  getPublicRecordedVideo,
  getPublicRecordedVideos,
  getRecordedVideo,
  getAllRecordedVideos,
  addRecordedVideo,
  editRecordedVideo,
  destroyRecordedVideo,
};
