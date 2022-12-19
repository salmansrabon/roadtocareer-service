const { sequelize, DataTypes } = require("../config");

const assignmentsSchema = sequelize.define("assignments", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  courseId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  packageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  /**
   * 0 -> {
   *  question: question,
   *  answer
   * }
   */

  questions: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  assignmentStartDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  assignmentEndDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

const findOne = async (filters = {}, attributes = null) => {
  const response = await assignmentsSchema.findOne({
    where: { ...filters },
    ...(attributes && { attributes }),
  });
  return response;
};

const findAll = async (
  filters = {},
  attributes = null,
  limit = null,
  page = 1,
  order = [
    ["createdAt", "DESC"],
    ["updatedAt", "DESC"],
  ]
) => {
  const offset = limit ? (page - 1) * limit : null;
  //return data in descending order
  const response = await assignmentsSchema.findAndCountAll({
    where: { ...filters },
    ...(attributes && { attributes }),
    ...(offset && { offset }),
    ...(limit && { limit }),
    order: order,
  });
  return response;
};

const create = async (data) => {
  const response = await assignmentsSchema.create(data);
  return response;
};

const update = async (id, data) => {
  const response = await assignmentsSchema.update(data, {
    where: {
      id: id,
    },
  });
  return response;
};

const destroy = async (filters) => {
  const response = await assignmentsSchema.destroy({
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
