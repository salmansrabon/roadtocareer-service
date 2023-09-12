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
      SELECT s.id, s.courseId, s.package, s.batch, s.courseTitle, s.name, s.mobile, s.email, s.university, s.profession, COALESCE(p.updatedAt, '00001-01-01') as updatedAt
      FROM students s
      LEFT JOIN payments p 
      ON s.id = p.studentId
      AND s.courseId = p.courseId
      WHERE`;

    if (input.studentId) {
      query += ` AND s.id = '${input.studentId}'`;
    }

    if (input.name) {
      query += ` AND s.name LIKE '%${input.name}%'`;
    }

    if (input.courseId) {
      query += ` AND s.courseId = '${input.courseId}'`;
    }

    if (input.batch) {
      query += ` AND s.batch = ${Number(input.batch)}`;
    }

    if (input.monthName) {
      if (input.courseId) {
        query += ` AND (MONTH(p.updatedAt) IS NULL OR p.due > 0) AND s.id NOT IN (SELECT p2.studentId FROM payments p2 WHERE MONTHNAME(p2.updatedAt) = '${input.monthName}' AND p2.courseId = '${input.courseId}')`;
      } else {
        query += ` AND (MONTH(p.updatedAt) IS NULL OR p.due > 0) AND s.id NOT IN (SELECT p2.studentId FROM payments p2 WHERE MONTHNAME(p2.updatedAt) = '${input.monthName}')`;
      }
    } else {
      query += ` AND (MONTH(p.updatedAt) IS NULL OR p.due > 0)`;
    }

    query = query.replace(`WHERE AND`, `WHERE`);
    query += ` ORDER BY s.courseId DESC, s.batch DESC, p.due DESC`;

    console.log(query)

    response = await sequelize.query(query, { type: QueryTypes.SELECT });
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
};

// const getAllPayments = async (req, res) => {
//   let input = {...req?.query};
//   input.filterRef = null;
//   let query = null;
//   let response = [];
//   if(input?.showDues == 'true'){
//     if(input?.batch){
//       query = `SELECT * from payments where studentId in (SELECT studentId FROM payments GROUP by studentId HAVING SUM(installmentAmount)-sum(discount)-sum(paidAmount) >0) and batch = ${Number(input?.batch)}`
//     }
//     else{
//       query = `SELECT * from payments where studentId in (SELECT studentId FROM payments GROUP by studentId HAVING SUM(installmentAmount)-sum(discount)-sum(paidAmount) >0)`
//     }
//     if (input?.studentId) {
//       query += ` AND studentId = '${input?.studentId}'`;
//     }
//     if (input?.name) {
//       query += ` AND name LIKE '%${input?.name}%'`;
//     }
//     response = await sequelize.query(
//       query,
//       { type: QueryTypes.SELECT }
//     );

//     response = {rows:response}
//     response.count = response.rows.length;
//   }
//   else if (input.isUnpaid === 'true') {
//     const currentYear = new Date().getFullYear();

//     const monthNames = {
//       January: '01',
//       February: '02',
//       March: '03',
//       April: '04',
//       May: '05',
//       June: '06',
//       July: '07',
//       August: '08',
//       September: '09',
//       October: '10',
//       November: '11',
//       December: '12'
//     };

//     const monthValue = monthNames[input.monthName] || null;

//     query = `
//      SELECT s.id, s.courseId, s.package, s.batch, s.courseTitle, s.name, s.mobile, s.email, s.university, s.profession, '0001-01-01' as updatedAt
//      FROM students s
//      LEFT JOIN payments p 
//      ON s.id = p.studentId
//      AND s.courseId = p.courseId
//      WHERE YEAR(p.updatedAt) = ${currentYear}
//      `;

//     if (monthValue) {
//       query += ` AND (MONTH(p.updatedAt) IS NULL OR MONTH(p.updatedAt) != ${Number(monthValue)})`;
//     } else {
//       query = query.replace(`YEAR(p.updatedAt) = ${currentYear}`, ``);
//       query += ` MONTH(p.updatedAt) IS NULL`;
//     }

//     if (input.courseId) {
//       query += ` AND s.courseId = '${input.courseId}'`;
//     }

//     if (input.batch) {
//       query += ` AND s.batch = ${Number(input.batch)}`;
//     }

//     if (input.studentId) {
//       query += ` AND s.id = '${input.studentId}'`;
//     }

//     if (input.name) {
//       query += ` AND s.name LIKE '%${input.name}%'`;
//     }

//     query += ` ORDER BY s.batch DESC`

//     response = await sequelize.query(query, { type: QueryTypes.SELECT });
//     response = { rows: response };
//     response.count = response.rows.length;
//   } 
//   else{
//     response = await Payment.findAll({ ...req?.query});
//     response.count = response.length;
//   }

//   res.status(200).send({
//     message: "All payments fetched successfully",
//     data: response,
//   });
// };

// const getAllPayments = async (req, res) => {
//   let response = [];
//   if (req?.query?.showDues == 'true'){
//       response = await sequelize.query(
//         "SELECT * from payments where studentId in (SELECT studentId FROM payments GROUP by studentId HAVING SUM(installmentAmount)-sum(discount)-sum(paidAmount) >0)",
//         { type: QueryTypes.SELECT }
//       );
//       response = {rows:response}
   
//   } else {
//     response = await Payment.findAll({ ...req?.query});
//   }

//   res.status(200).send({
//     message: "All payments fetched successfully",
//     data: response,
//   });
// };

const addPayment = async (req, res) => {
  // console.log(req.body);
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
  // const payments  = await Payment.findAll({studentId, courseId});
  // let totalPaid = 0;
  // if (!isEmpty(payments.rows)){
  //   for(let row in payments){
  //     totalPaid += row.paidAmount;
  //   }
  // }
  let response = {};

  if (isEmpty(payment)) {
    response = await Payment.create({
      id,
      studentId,
      name: student.name,
      batch: student.batch,
      // due: due,
      // paidAmount: installmentAmount - discount,
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
      // due: due,
      // paidAmount: installmentAmount - discount,
      ...req.body,
    });
  }

  res.status(201).send({
    message: "Payment added successfully",
    data: response,
  });
};

const editPayment = async (req, res) => {
  const { id } = req.params;
  const payment = await Payment.findOne({ id });

  if (isEmpty(payment)) {
    throw customError({
      code: 404,
      message: "Payment not found",
    });
  }

  await Payment.update(id, req.body);
  const updatedPayment = await Payment.findOne({ id });

  req.status(201).send({
    message: "Payment updated successfully",
    data: updatedPayment,
  });
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
