const Joi = require("joi");

const signinSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required().min(8).max(12),
  
  
});

const signupSchema = Joi.object({
  role: Joi.string().valid("admin", "student"),
  email: Joi.string().required().pattern(new RegExp(/^[a-z0-9]((\.|\+)?[a-z0-9]){4,}@g(oogle)?mail\.com$/)),
  password: Joi.when("role", {
    is: "admin",
    then: Joi.string().min(8).max(12).required(),
  }),
  name: Joi.string().when("role", {
    not: Joi.exist(),
    then: Joi.required(),
  }),
  university: Joi.string().when("role", {
    not: Joi.exist(),
    then: Joi.required(),
  }),
  city: Joi.string().allow(""),
  mobile: Joi.string().when("role", {
    not: Joi.exist(),
    then: Joi.required(),
  }),
  profession: Joi.string().when("role", {
    not: Joi.exist(),
    then: Joi.required(),
  }),
  passingYear:Joi.string().allow(""),
  experience: Joi.string().allow(""),
  company: Joi.string().allow(""),
  courseId: Joi.string().when("role", { //.uuid()
    not: Joi.exist(),
    then: Joi.required(),
  }),
  package: Joi.string().when("role", {
    not: Joi.exist(),
    then: Joi.required(),
  }),
  knowMe: Joi.string().required(),
  shareSomething: Joi.string().allow(""),
});

const coursesSchema = Joi.object({
  courseTitle: Joi.string().required(),
  courseInitial: Joi.string().required(),
  batch: Joi.number().required(),
  image: Joi.string().allow(""),
  video: Joi.string().min(11).max(11).allow(""),
  // price: Joi.array().items(
  //   Joi.object({
  //     packageName: Joi.string(),
  //     studentFee: Joi.number().positive().required(),
  //     jobHolderFee: Joi.number().positive().required(),
  //   }).allow("")
  // ),
  description: Joi.string().required(),
  contents: Joi.string(),
  enrollmentStartDate: Joi.date().allow(""),
  enrollmentEndDate: Joi.date().allow(""),
  orientationDate: Joi.date().allow(""),
  classStartDate: Joi.date().allow(""),
  classDays: Joi.array().items(Joi.string()),
  classTime: Joi.object({
    start: Joi.string().required(),
    end: Joi.string(),
  }),
  isEnabled: Joi.boolean(),
  notice: Joi.string().allow(""),
});

const paymentSchema = Joi.object({
  courseId: Joi.string().required(),
  installmentNo: Joi.number().required(),
  installmentAmount: Joi.number().required(),
  discount: Joi.number(),
  paidAmount:Joi.number().required(),
  comment: Joi.string(),
  monthName: Joi.string().required(),
  due:Joi.number().required()
});

const validator = (data, type) => {
  const schemas = {
    signin: signinSchema,
    signup: signupSchema,
    course: coursesSchema,
    payment: paymentSchema,
  };

  const { error } = schemas[type].validate(data);
  if (error) throw error;
};

module.exports = validator;
