const { sequelize, DataTypes } = require("../config");

const packagesSchema = sequelize.define("packages", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  courseId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  packageName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  studentFee: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  jobHolderFee: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue:0
  },
});

const findOne = async (filters = {}, attributes = null) => {
  const response = await packagesSchema.findOne({
    where: { ...filters },
    ...(attributes && { attributes }),
  });
  return response;
};

const findAll = async (filters = {}, attributes = null, limit = null, page = 1, order = [['createdAt', 'DESC'], ['updatedAt', 'DESC']]) => {
  const offset = limit ? (page - 1) * limit : null;
  //return data in descending order
  const response = await packagesSchema.findAndCountAll({
    where: { ...filters },
    ...(attributes && { attributes }),
    ...(offset && { offset }),
    ...(limit && { limit }),
    order: order,
  });
  return response;
};

const create = async (data) => {
  const response = await packagesSchema.create(data);

  return response;
};

const update = async (id, data) => {
  const response = await packagesSchema.update(data, {
    where: {
      id: id,
    },
  });
  return response;
};
const destroy = async (filters) => {
  const response = await packagesSchema.destroy({
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
