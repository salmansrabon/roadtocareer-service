const { sequelize, DataTypes } = require("../config");

const teachersSchema = sequelize.define("teachers", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  courseIds: {
    type: DataTypes.JSON, //[couse id list....]
    allowNull: false,
  },
  moduleIds: {
    type: DataTypes.JSON, //[couse id list....]
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  university: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
});

const findOne = async (filters = {}, attributes = null) => {
  const response = await teachersSchema.findOne({
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
  other = null,
  order = [
    ["createdAt", "DESC"],
    ["updatedAt", "DESC"],
  ]
) => {
  const offset = limit ? (page - 1) * limit : null;
  const response = await teachersSchema.findAndCountAll({
    where: { ...filters },
    ...(other && other),
    ...(attributes && { attributes }),
    ...(offset && { offset }),
    ...(limit && { limit }),
    order: order,
  });
  return response;
};

const create = async (data) => {
  const response = await teachersSchema.create(data);
  return response;
};

const update = async (id, data) => {
  const response = await teachersSchema.update(data, {
    where: {
      id: id,
    },
  });
  return response;
};

const destroy = async (filters) => {
  const response = await teachersSchema.destroy({
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
