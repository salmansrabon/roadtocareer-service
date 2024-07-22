const { v4: uuidV4 } = require("uuid");
const { isEmpty } = require("lodash");
const { Student, Payment, Course } = require("../models");
const { validator, customError, mailer } = require("../utils");
const { sequelize } = require("../config");
const { QueryTypes } = require("sequelize");

const getPayments = async (req, res) => {
  const { studentId, courseId } = req.params;

  const response = await Payment.findAll({ studentId, courseId });
  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "Payments not found",
    });
  }

  res.status(200).send({
    message: "Payment fetched successfully",
    data: response,
  });
};

const getPayment = async (req, res) => {
  const { studentId, courseId } = req.params;

  const response = await Payment.findAll({ studentId });
  if (isEmpty(response.rows)) {
    throw customError({
      code: 404,
      message: "Payments not found",
    });
  }

  res.status(200).send({
    message: "Payment fetched successfully",
    data: response,
  });
};

const getAllPayments = async (req, res) => {
  try{
  let input = { ...req?.query };
  input.filterRef = null;
  let query = null;
  let response = [];
  if (input?.showDues == 'true') {
    if (input?.batch) {
      query = `SELECT * from payments where studentId in (SELECT studentId FROM payments GROUP by studentId HAVING SUM(installmentAmount)-sum(discount)-sum(paidAmount) >0) and batch = ${Number(input?.batch)}`
    }
    else {
      query = `SELECT * from payments where studentId in (SELECT studentId FROM payments GROUP by studentId HAVING SUM(installmentAmount)-sum(discount)-sum(paidAmount) >0)`
    }
    if (input?.studentId) {
      query += ` AND studentId = '${input?.studentId}'`;
    }
    if (input?.name) {
      query += ` AND name LIKE '%${input?.name}%'`;
    }
    response = await sequelize.query(
      query,
      { type: QueryTypes.SELECT }
    );

    response = { rows: response }
    response.count = response.rows.length;
  }
  else if (input.isUnpaid === 'true') {
    query = `
    SELECT s.id, s.courseId, s.package, s.batch, s.courseTitle, s.name, s.mobile, s.email, s.university, s.profession, COALESCE(p.updatedAt, '0001-01-01') AS updatedAt 
    FROM students s 
    LEFT JOIN payments p ON s.id = p.studentId AND p.courseId = s.courseId AND p.monthName = :monthName 
    WHERE s.isEnrolled = 1`;

  const replacements = { monthName: input.monthName }; // Object to hold parameter values

  if (input.monthName && input.courseId) {
    query += ` AND s.courseId = :courseId AND p.courseId IS NULL`;
    replacements.courseId = input.courseId; // Add courseId to replacements object
  }

  console.log(query); // Log the generated query

  // Execute the query with Sequelize (assuming sequelize is the Sequelize instance)
  response = await sequelize.query(query, {
    replacements: replacements,
    type: QueryTypes.SELECT
  });

  response = { rows: response };
  response.count = response.rows.length;
  }
  else {
    response = await Payment.findAll({ ...req?.query });
    response.count = response.length;
  }

  res.status(200).send({
    message: "All payments fetched successfully",
    data: response,
  });
}catch(error){
  console.log(error);
  throw customError({
    code:404,
    message:"CError"
  })
}
};


const addPayment = async (req, res) => {
  console.log(req.body);
  try {
    validator(req.body, "payment");
  } catch (err) {
    console.log(err);
    throw customError({
      code: 404,
      message: "Validation error",
    });
  }

  const { studentId } = req.params;

  const { courseId, installmentNo, installmentAmount, paidAmount, discount, due } = req.body;

  const [payment, student, course] = await Promise.all([
    Payment.findOne({ studentId, courseId, installmentNo }),
    Student.findOne({ id: studentId }, ["name", "batch", "email", "profession", "package"]),
    Course.findOne({ id: courseId }),
  ]);

  const coursePackage = JSON.parse(course.price).find(
    (item) => item.packageName === student.package
  );
  const courseFee =
    student.profession === "Job Holder" ? coursePackage.jobHolderFee : coursePackage.studentFee;

  const id = uuidV4();
  let response = {};

  if (isEmpty(payment)) {
    response = await Payment.create({
      id,
      studentId,
      name: student.name,
      batch: student.batch,
      ...req.body,
    }).then(() => {
      mailer.sendMail({
        name: student.name,
        email: student.email,
        courseTitle: course.courseTitle,
        batch: course.batch,
        installmentNo: installmentNo,
        installmentAmount: installmentAmount,
        paidAmount: paidAmount,
        discount: discount,
        due: due,
        type: "sendPayment",
      });
    });
  } else {
    response = await Payment.update(payment.id, {
      name: student.name,
      batch: student.batch,
      ...req.body,
    });
  }

  res.status(201).send({
    message: "Payment added successfully",
    data: response,
  });
};

const editPayment = async (req, res) => {
  console.log('heyy there');
  const id  = req.params.paymentId;
  console.log(id);
  const payment = await Payment.findOne({ id });

  if (isEmpty(payment)) {
    throw customError({
      code: 404,
      message: "Payment not found",
    });
  }
try{
  await Payment.update(id, req.body);
  const updatedPayment = await Payment.findOne({ id });

  res.status(201).send({
    message: "Payment updated successfully",
    data: updatedPayment,
  });
}
catch(err){
  console.log(err);
  throw customError({
    code: 404,
    message: "CF Error",
  });
}
};

const destroyPayment = async (req, res) => {
  const { id } = req.params;
  const payment = await Payment.findOne({ id });

  if (isEmpty(payment)) {
    throw customError({
      code: 404,
      message: "Payment not found",
    });
  }

  const response = await Payment.destroy({ id });
  res.status(201).send({
    message: "Payment deleted sucessfully",
  });
};

module.exports = {
  getPayments,
  getAllPayments,
  addPayment,
  editPayment,
  getPayment,
  destroyPayment,
};
