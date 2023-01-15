const { v4: uuidV4 } = require("uuid");
const { isEmpty } = require("lodash");
const { quizes } = require("../models");
const { validator, customError } = require("../utils");

// Public Controllers
const getPublicQuiz = async (req, res) => {
  const filters = req.query;
  const response = await quizes.findOne({ ...filters });
  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "quiz not found",
    });
  }
  res.status(200).send({
    message: "quiz fetched successfully",
    data: response,
  });
};

const getPublicQuizes = async (req, res) => {
  const filters = req.query || {};
  const response = await quizes.findAll({ ...filters });
  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "No quiz found",
    });
  }
  res.status(200).send({
    message: "quizes fetched successfully",
    data: response,
  });
};

// Private Controllers
const getQuiz = async (req, res) => {
  const { id } = req.params;
  const response = await quizes.findOne({ id });

  if (isEmpty(response)) {
    throw customError({
      code: 404,
      message: "quiz not found",
    });
  }
  res.status(200).send({
    message: "quiz fetched successfully",
    data: response,
  });
};

const getRandQuestions = async (req, res) => {
  // console.log(req.params)
  const { id } = req.params;
  const quiz = await quizes.findOne({ id });
  if (isEmpty(quiz)) {
    throw customError({
      code: 404,
      message: "quiz not found",
    });
  }
  let questions = JSON.parse(quiz.questions);
  let quids = Object.keys(questions);
  let randQuesId = [];
  let randQuestions = {};
  let maxQ = quids.length < quiz.maxQues ? quids.length : quiz.maxQues;
  let r = "";
  // console.log(maxQ)
  try {
    while (randQuesId.length < maxQ) {
      r = quids[Math.floor(Math.random() * quids.length)];
      if (randQuesId.indexOf(r) === -1) randQuesId.push(r);
    }

    for (let quid of randQuesId) {
      randQuestions[quid] = questions[quid];
    }
  } catch (err) {
    console.log(err);
    throw customError({
      name: "Error404",
      code: 404,
      message: "CError",
    });
  }
  // console.log(randQuesId)
  res.status(200).send({
    message: "quiz fetched successfully",
    data: randQuestions,
  });
};

const getQuestions = async (req, res) => {
  // console.log(req.params)
  const { id } = req.params;
  const { quids } = req.body;
  const quiz = await quizes.findOne({ id });
  if (isEmpty(quiz)) {
    throw customError({
      code: 404,
      message: "quiz not found",
    });
  }
  let questions = JSON.parse(quiz.questions);
  let randQuestions = {};
  // console.log(maxQ)
  try {
    for (let quid of quids ) {
      randQuestions[quid] = questions[quid];
    }
  } catch (err) {
    console.log(err);
    throw customError({
      name: "Error404",
      code: 404,
      message: "CError",
    });
  }
  // console.log(randQuesId)
  res.status(200).send({
    message: "quiz fetched successfully",
    data: randQuestions,
  });
};

const getAnswers = async (req, res) => {
  // console.log(req.params)
  const { id } = req.params;
  const { quids } = req.body;
  const quiz = await quizes.findOne({ id });
  if (isEmpty(quiz)) {
    throw customError({
      code: 404,
      message: "quiz not found",
    });
  }
  let answers = JSON.parse(quiz.answers);
  let randAnswers = {};
  // console.log(maxQ)
  try {
    for (let quid of quids ) {
      randAnswers[quid] = answers[quid];
    }
  } catch (err) {
    console.log(err);
    throw customError({
      name: "Error404",
      code: 404,
      message: "CError",
    });
  }
  // console.log(randQuesId)
  res.status(200).send({
    message: "quiz fetched successfully",
    data: randAnswers,
  });
};

const getAllQuizes = async (req, res) => {
  let { id, role, ...filters } = req.query;

  if (role == "student") {
    const student = await Student.findOne({ id });
    if (isEmpty(student)) {
      throw customError({
        code: 404,
        message: "Student not found",
      });
    }
    filters.courseId = student.courseId;

    const package = await packages.findOne({
      courseId: student.courseId,
      packageName: student.package,
    });
    if (isEmpty(package)) {
      throw customError({
        code: 404,
        message: "Package not found",
      });
    }
    filters.packageId = package.id;
  }

  const response = await quizes.findAll({ ...filters });

  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "No quiz found",
    });
  }
  res.status(200).send({
    message: "quizes fetched successfully",
    data: response,
  });
};

const addQuiz = async (req, res) => {
  const response = await quizes.create({ ...req.body });
  res.status(201).send({
    message: "quiz added successfully",
    data: response,
  });
};

const editQuiz = async (req, res) => {
  const { id } = req.params;
  const quiz = await quizes.findOne({ id });

  if (isEmpty(quiz)) {
    throw customError({
      code: 404,
      message: "quiz not found",
    });
  }

  await quizes.update(id, req.body);
  const updatedquiz = await quizes.findOne({ id });

  res.status(201).send({
    message: "quiz updated successfully",
    data: updatedquiz,
  });
};

const destroyQuiz = async (req, res) => {
  const { id } = req.params;
  const Quiz = await quizes.findOne({ id });

  if (isEmpty(Quiz)) {
    throw customError({
      code: 404,
      message: "Quize not found",
    });
  }

  const response = await quizes.destroy({ id });
  res.status(201).send({
    message: "Quize deleted sucessfully",
  });
};
module.exports = {
  getPublicQuiz,
  getPublicQuizes,
  getQuiz,
  getAllQuizes,
  addQuiz,
  editQuiz,
  destroyQuiz,
  getRandQuestions,
  getQuestions,
  getAnswers,
};
