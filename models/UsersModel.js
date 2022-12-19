const { sequelize, DataTypes } = require("../config");

const usersSchema = sequelize.define("users", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "student",
  },
  pcToken:{
    type:DataTypes.STRING,
    allowNull:true,
    defaultValue:""
  }
});

const findOne = async (filters = {}, attributes = null) => {
  const response = await usersSchema.findOne({
    where: { ...filters },
    ...(attributes && { attributes }),
  });
  return response;
};

const findAll = async () => {
  const response = await usersSchema.findAll({
    attributes: ["id", "email", "role"],
  });
  return response;
};

const create = async (data) => {
  const response = await usersSchema.create(data);
  return response;
};

const update = async (id, data) => {
  const response = await usersSchema.update(data, {
    where: {
      id: id,
    },
  });
  return response;
};

const destroy = async (filters) => {
  const response = await usersSchema.destroy({
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
