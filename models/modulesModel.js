const { sequelize, DataTypes } = require("../config");

const modulesSchema = sequelize.define("modules", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  courseId:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  packageId:{
    type:DataTypes.INTEGER,
    allowNull:false
  }, 
  module: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue:[]
  },
});

const findOne = async (filters = {}, attributes = null) => {
  const response = await modulesSchema.findOne({
    where: { ...filters },
    ...(attributes && { attributes }),
  });
  return response;
};

const findAll = async (filters = {}, attributes = null, limit = null, page = 1, order = [['createdAt', 'DESC'], ['updatedAt', 'DESC']]) => {
  const offset = limit ? (page - 1) * limit : null;
  //return data in descending order
  const response = await modulesSchema.findAndCountAll({
    where: { ...filters },
    ...(attributes && { attributes }),
    ...(offset && { offset }),
    ...(limit && { limit }),
    order: order,
  });
  return response;
};

const create = async (data) => {
  const response = await modulesSchema.create(data);
  return response;
};

const update = async (id, data) => {
  // console.log(data)
  const response = await modulesSchema.update(data, {
    where: {
      id: id,
    },
  });
  return response;
};
const destroy = async (filters) => {
  const response = await modulesSchema.destroy({
    where: {
      ...filters
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
