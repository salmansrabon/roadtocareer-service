const { v4: uuidV4 } = require("uuid");
const { isEmpty } = require("lodash");
const { quizes, Student, Course, packages, teachers } = require("../models");
const { validator, customError } = require("../utils");
const { object } = require("joi");

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
const checkQuizDate = async (req, res) => {
  const { id } = req.params;

  const { studentId } = req.query;
  // console.log(studentId)
  const date = new Date();
  const student = await Student.findOne({ id: studentId });
  // console.log(student)
  if (isEmpty(student)) {
    throw customError({
      code: 404,
      message: "Student not found",
    });
  }
  const quiz = await quizes.findOne({ id });
  if (isEmpty(quiz)) {
    throw customError({
      code: 404,
      message: "Course Not Found!",
    });
  }
  let quizStartDate = new Date(quiz.quizStartDate);
  let quizEndDate = new Date(quiz.quizEndDate);
  let stQuiz = JSON.parse(student.quizAnswers);
  if (date.getTime() >= quizStartDate.getTime()) {
    try {
      if (date.getTime() <= quizEndDate.getTime()) {
        // console.log(stQuiz)
        // console.log(stQuiz[id])
        if (id in stQuiz) {
          let stQuizTime = stQuiz[id].startTime;

          let quids = Object.keys(stQuiz[id].answers);
          let stDateTime = new Date(stQuizTime);
          // let [hour, minute] = stQuizTime.split(":");

          // stDateTime.setHours(hour, minute);
          if (stQuiz[id].hasOwnProperty("submitted")) {
            if (stQuiz[id]["submitted"] == true) {
              return {
                message: "Student already submitted the quiz",
                state: 3,
                quids: quids,
              };
            }
          }
          if (date.getTime() <= stDateTime.getTime() + quiz.totalTime * 60 * 1000) {
            return {
              message: "Quiz is running and student has already started the quiz.",
              state: 2,
              quids: quids,
            };
          } else {
            // console.log(quiz.totalTime)
            // console.log(date.getTime())
            // console.log(stDateTime.getTime())

            // console.log(JSON.parse(student.attendances));
            return {
              message: "Student quiz time has been finished.",
              state: 3,
              quids: quids,
            };
          }
        } else {
          return {
            message: "Quiz is open and student can start the quiz.",
            state: 1,
          };
        }
      } else {
        if (id in stQuiz) {
          let quids = Object.keys(stQuiz[id].answers);
          return {
            message: "Quiz allready ended at " + quizEndDate.toLocaleString(),
            state: 3,
            quids: quids,
          };
        } else {
          return {
            message:
              "Quiz allready ended at " +
              quizEndDate.toLocaleString() +
              " Student did not participated in the course.",
            state: 4,
          };
        }
      }
    } catch (err) {
      console.log(err);
      throw customError({});
    }
  } else {
    return {
      message: "Quiz will start at " + quizStartDate.toLocaleString(),
      state: 0,
    };
  }
};
const getRandQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.query;

    const quiz = await quizes.findOne({ id });
    if (isEmpty(quiz)) {
      throw customError({
        name: "Error404",
        code: 404,
        message: "CError",
      });
    }
    let checkDate = await checkQuizDate(req, res);
    // console.log("helloooooooooo");
    let questions = JSON.parse(quiz.questions);
    if (checkDate.state == 1) {
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
        let sAns = {};
        for (let quid of randQuesId) {
          randQuestions[quid] = questions[quid];
          sAns[quid] = "";
        }
        const student = await Student.findOne({ id: studentId });
        let stQuiz = JSON.parse(student.quizAnswers);
        stQuiz[id] = { startTime: new Date(), answers: sAns, marks: 0 };
        console.log(stQuiz);
        const upResponse = await Student.update(studentId, { quizAnswers: stQuiz });
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
        data: {
          randQuestions,
          message: checkDate.message,
          state: checkDate.state,
        },
      });
    } else if (checkDate.state == 2) {
      let quids = checkDate.quids;
      let randQuestions = {};
      for (let quid of quids) {
        randQuestions[quid] = questions[quid];
      }
      res.status(200).send({
        data: {
          message: checkDate.message,
          state: checkDate.state,
          randQuestions,
        },
      });
    } else if (checkDate.state == 3) {
      let answers = JSON.parse(quiz.answers);
      let quids = checkDate.quids;
      let randAnswers = {};
      let randQuestions = {};

      // console.log(maxQ)
      try {
        for (let quid of quids) {
          randAnswers[quid] = answers[quid];
        }
        for (let quid of quids) {
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
        data: {
          randAnswers,
          randQuestions,
          message: checkDate.message,
          state: checkDate.state,
        },
      });
    } else {
      res.status(200).send({
        data: {
          message: checkDate.message,
          state: checkDate.state,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw customError({
      name: "Error404",
      code: 404,
      message: "CError",
    });
  }
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
  if (typeof quids == "undefined" || !quids) {
    return res.status(200).send({
      message: "quiz fetched successfully",
      data: questions,
    });
  }

  // console.log(maxQ)
  try {
    for (let quid of quids) {
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
  const { studentId } = req.query;
  let quids = req.query?.quids;
  let randAnswers = {};

  try {
    if (quids == undefined) {
      const student = await Student.findOne({ id: studentId });
      let stQuiz = JSON.parse(student.quizAnswers);
      console.log(stQuiz);
      if (id in stQuiz) {
        quids = Object.keys(stQuiz[id].answers);
      }
    }
    const quiz = await quizes.findOne({ id });
    if (isEmpty(quiz)) {
      throw customError({
        code: 404,
        message: "quiz not found",
      });
    }
    let answers = JSON.parse(quiz.answers);
    // console.log(maxQ)

    for (let quid of quids) {
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
  
  try {
    if (role == "student") {
      const student = await Student.findOne({ id });
      if (isEmpty(student)) {
        throw customError({
          code: 404,
          message: "Student not found",
        });
      }
      filters.courseId = student.courseId;

      // const package = await packages.findOne({
      //   courseId: student.courseId,
      //   packageName: student.package,
      // });
      // if (isEmpty(package)) {
      //   throw customError({
      //     code: 404,
      //     message: "Package not found",
      //   });
      // }
      // filters.packageId = package.id;
    }

    if (req.user.role == "teacher" && filters?.courseId == undefined) {
      const teacher = await teachers.findOne({ id: req.user.id });
      let courseIds = JSON.parse(teacher.courseIds);
      // let packageIds = JSON.parse(teacher.courseIds).map((value, index) => value.split("+").pop());
      filters.courseId = courseIds;
      // console.log(packageIds)
      // filters.packageId = packageIds;
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
  } catch (err) {
    console.log(err);
    throw customError({
      code: 404,
      message: "Some error occured.",
    });
  }
};

const addQuiz = async (req, res) => {
  console.log(req.body)
  try{

  const response = await quizes.create({ ...req.body });
  res.status(201).send({
    message: "quiz added successfully",
    data: response,
  });
}catch(err){
  console.log(err);
  throw customError({
    code:403,
    message:"CError"
  })
}
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

const getQuizMarks = async (req, res) => {
  const { id } = req.params;
  const quiz = await quizes.findOne({ id });
  if (isEmpty(quiz)) {
    throw customError({
      code: 404,
      message: "quiz not found",
    });
  }
  try {
    const students = await Student.findAll({ courseId: quiz.courseId });
    // console.log(students.rows)
    if (isEmpty(students)) {
      throw customError({
        code: 404,
        message: "No students registered in this course",
      });
    }
    let response = [];
    for (student of students.rows) {
      let stQuiz = JSON.parse(student.quizAnswers)??{};
      if (id in stQuiz) {
        let resp = {
          courseTitle: student.courseTitle,
          studentId: student.id,
          courseId: quiz.courseId,
          studentName: student.name,
          profession: student.profession,
          university: student.university,
          quizId: quiz.id,
          quizTitle: quiz.title,
          marks: stQuiz[id]?.marks ?? 0,
          quizAnswer:stQuiz[id],
          totalMarks:quiz.maxQues
        };
        response.push(resp);
      }
    }
    res.status(201).send({
      message: "retrive quiz marks successfully",
      data: response,
    });
  } catch (err) {
    console.log(err);
    throw customError({
      code: 403,
      message: "CError",
    });
  }
};

// const destroyQuiz = async (req, res) => {
//   const { id } = req.params;
//   const Quiz = await quizes.findOne({ id });

//   if (isEmpty(Quiz)) {
//     throw customError({
//       code: 404,
//       message: "Quize not found",
//     });
//   }

//   const response = await quizes.destroy({ id });
//   res.status(201).send({
//     message: "Quize deleted sucessfully",
//   });
// };

const destroyQuiz = async (req, res) => {
  const { id } = req.params;
  const Quiz = await quizes.findOne({ id });

  if (!Quiz) {
    throw customError({
      code: 404,
      message: "Quiz not found",
    });
  }

  const response = await quizes.destroy({ id });
  if (response) {
    res.status(204).send();
  } else {
    throw customError({
      code: 500,
      message: "Failed to delete quiz",
    });
  }
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
  getQuizMarks,
};
