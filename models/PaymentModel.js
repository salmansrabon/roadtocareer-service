const { sequelize, DataTypes } = require("../config");
const { studentsSchema } = require("./StudentsModel");

const paymentSchema = sequelize.define("payment", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courseId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  batch: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  installmentNo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  installmentAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  discount: {
    type: DataTypes.INTEGER,
  },
  paidAmount: {
    type: DataTypes.INTEGER,
  },
  due: {
    type: DataTypes.INTEGER,
  },
  comment: {
    type: DataTypes.STRING,
  },
  payable:{
    type:DataTypes.INTEGER,
  },
  monthName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const findOne = async (filters = {}, attributes = null) => {
  const response = await paymentSchema.findOne({
    where: { ...filters },
    ...(attributes && { attributes }),
  });
  return response;
};

const findAll = async (filters = {}, attributes = null, limit = null, page = 1, order = [['createdAt', 'DESC'], ['updatedAt', 'DESC']]) => {
  // Define relationships between the `studentsSchema` and `paymentSchema` models
  studentsSchema.hasMany(paymentSchema, { foreignKey: 'studentId', sourceKey: 'id' });
  paymentSchema.belongsTo(studentsSchema, { foreignKey: 'studentId', targetKey: 'id' });

  const offset = limit ? (page - 1) * limit : null;

  // Query to fetch payments with associated student email
  const response = await paymentSchema.findAndCountAll({
    where: { ...filters },
    ...(offset && { offset }),
    ...(limit && { limit }),
    order,
    attributes: {
      include: [
        // Add `students.email` as a top-level attribute named `studentEmail`
        [sequelize.col('student.email'), 'studentEmail'],
      ],
    },
    include: [
      {
        model: studentsSchema, // Include the related `studentsSchema` model
        attributes: [], // Exclude all attributes from the `studentsSchema` to avoid nested results
      },
    ],
  });

  return response;
};

const create = async (data) => {
  const response = await paymentSchema.create(data);
  return response;
};

const update = async (id, data) => {
  const response = await paymentSchema.update(data, {
    where: {
      id: id,
    },
  });
  return response;
};
const destroy = async (filters) => {
  const response = await paymentSchema.destroy({
    where: {
      ...filters,
    },
  });
  return response;
};
module.exports = {
  findOne,
  findAll,
  create,
  update,
  destroy
};
