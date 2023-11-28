const { sequelize, DataTypes } = require("../config");

const coursesSchema = sequelize.define("courses", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  courseTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courseInitial: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  batch: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // unique:true
  },
  image: {
    type: DataTypes.STRING,
  },
  video: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  contents: {
    type: DataTypes.TEXT,
  },
  price:{
    type:DataTypes.JSON,
    allowNull:true
  },
  contentSyllabus: {
    type: DataTypes.TEXT,
  },
  enrollmentStartDate: {
    type: DataTypes.DATE,
  },
  enrollmentEndDate: {
    type: DataTypes.DATE,
  },
  orientationDate: {
    type: DataTypes.DATE,
  },
  classStartDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  classDays: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  classTime: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  notice: {
    type: DataTypes.STRING,
  },
  drive_folder_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

const findOne = async (filters = {}, attributes = null) => {
  const response = await coursesSchema.findOne({
    where: { ...filters },
    ...(attributes && { attributes }),
  });
  return response;
};

const findAll = async (filters = {}, attributes = null, limit = null, page = 1, order = [['createdAt', 'DESC'], ['updatedAt', 'DESC']]) => {
  const offset = limit ? (page - 1) * limit : null;
  //return data in descending order
  const response = await coursesSchema.findAndCountAll({
    where: { ...filters },
    ...(attributes && { attributes }),
    ...(offset && { offset }),
    ...(limit && { limit }),
    order: order,
  });
  return response;
};

const create = async (data) => {
  const response = await coursesSchema.create(data);
  return response;
};

const update = async (id, data) => {
  // console.log(id)
  // console.log(data)
  const response = await coursesSchema.update(data, {
    where: {
      id: id,
    },
  }).catch((err)=>{
    // console.log(e)
    throw customError({
    code: 404,
    message: "Update unsucessfull",
  })});
  return response;
};
const destroy = async (filters) => {
  const response = await coursesSchema.destroy({
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
