const publicRouter = require("express").Router();
const privateRouter = require("express").Router();
const adminAccessRouter = require("express").Router();
const {
  userController,
  studentsController,
  paymentController,
  courseController,
  packageController,
  modulesController,
  assignmentsController,
  quizesController,
  teachersController
} = require("./controllers");

publicRouter.get("/health", (req, res) => res.status(200).send({ status: "OK" }));

publicRouter.post("/signin", userController.signIn);
publicRouter.post("/signup", userController.signUp);
publicRouter.put("/resetPassword/:pcToken", userController.resetPassword);
publicRouter.put("/sendResetLink", userController.sendResetLink);
publicRouter.put("/validatePCToken", userController.isAuthenticPCToken);

publicRouter.get("/course", courseController.getPublicCourse);
publicRouter.get("/courses", courseController.getPublicCourses);

publicRouter.get("/v1/modules", modulesController.getAllModules);
publicRouter.get("/v1/modules/:id", modulesController.getModule);

publicRouter.get("/v1/packages", packageController.getAllPackages);
publicRouter.get("/v1/packages/:id", packageController.getPackage);

privateRouter.get("/v1/auth", userController.isAuthenticated);
privateRouter.put("/v1/changePassword", userController.changePassword);
privateRouter.delete("/v1/user/:id", userController.destroyUser);




privateRouter.get("/v1/student", studentsController.getStudent);
privateRouter.get("/v1/students", studentsController.getAllStudents);
privateRouter.post("/v1/student/:studentId/validate", studentsController.validateStudent);
privateRouter.put("/v1/student/:studentId", studentsController.updateStudent);
privateRouter.put("/v1/student/validate/:studentId", studentsController.validateStudent)
privateRouter.delete("/v1/student/:id", studentsController.destroyStudent);
privateRouter.get("/v1/student/attendance/:id", studentsController.checkAttendanceDate);
privateRouter.put("/v1/student/attendance/:id", studentsController.addAttandence);
privateRouter.put("/v1/admin/addAttendance365/:id", studentsController.addAttandence_Admin)

privateRouter.get("/v1/payments/:studentId/:courseId", paymentController.getPayments);
privateRouter.get("/v1/payments", paymentController.getAllPayments);
privateRouter.post("/v1/payment/:studentId", paymentController.addPayment);
privateRouter.put("/v1/payment/:studentId", paymentController.editPayment);
privateRouter.get("/v1/payments/:studentId", paymentController.getPayment);
privateRouter.delete("/v1/payment/:id", paymentController.destroyPayment);


privateRouter.get("/v1/course", courseController.getCourse);
privateRouter.post("/v1/course", courseController.addCourse);
privateRouter.put("/v1/course/:id", courseController.editCourse);
privateRouter.get("/v1/courses", courseController.getAllCourses);
privateRouter.delete("/v1/course/:id", courseController.destroyCourse);



privateRouter.post("/v1/packages", packageController.addPackage);
privateRouter.put("/v1/packages/:id", packageController.editPackage);
privateRouter.delete("/v1/package/:id", packageController.destroyPackage);



privateRouter.post("/v1/modules", modulesController.addModule);
privateRouter.put("/v1/modules/:id", modulesController.editModule);
privateRouter.delete("/v1/module/:id", modulesController.destroyModule);


privateRouter.get("/v1/assignments", assignmentsController.getAllAssignments);
privateRouter.get("/v1/assignments/:id", assignmentsController.getAssignment);
privateRouter.post("/v1/assignments", assignmentsController.addAssignment);
privateRouter.put("/v1/assignments/:id", assignmentsController.editAssignment);
privateRouter.delete("/v1/assignment/:id", assignmentsController.destroyAssignment);


privateRouter.get("/v1/quizes", quizesController.getAllQuizes);
privateRouter.get("/v1/quizes/:id", quizesController.getQuiz);
privateRouter.get("/v1/quizes/getRandomQuestions/:id", quizesController.getRandQuestions)
privateRouter.get("/v1/quizes/getQuestions/:id", quizesController.getQuestions)
privateRouter.get("/v1/quizes/getSecretAnswers365/:id", quizesController.getAnswers)
privateRouter.get("/v1/quizes/getMarks/:id", quizesController.getQuizMarks)

privateRouter.post("/v1/quizes", quizesController.addQuiz);
privateRouter.put("/v1/quizes/:id", quizesController.editQuiz);
privateRouter.delete("/v1/quiz/:id", quizesController.destroyQuiz);


privateRouter.get("/v1/teachers", teachersController.getAllTeachers);
privateRouter.get("/v1/teachers/:id", teachersController.getTeacher);
privateRouter.post("/v1/teachers", teachersController.addTeacher);
privateRouter.put("/v1/teachers/:id", teachersController.editTeacher);
privateRouter.delete("/v1/teacher/:id", teachersController.destroyTeacher);



module.exports = {
  publicRouter,
  privateRouter,
  adminAccessRouter,
};
