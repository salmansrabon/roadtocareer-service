const { sequelize, DataTypes } = require("../config");

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
  const offset = limit ? (page - 1) * limit : null;
  const response = await paymentSchema.findAndCountAll({
    where: { ...filters },
    ...(attributes && { attributes }),
    ...(offset && { offset }),
    ...(limit && { limit }),
    order:order
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
