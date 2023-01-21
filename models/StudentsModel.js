const { sequelize, DataTypes } = require("../config");

const studentsSchema = sequelize.define("students", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  courseId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  package: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  batch: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  courseTitle: {
    type: DataTypes.STRING,
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
  profession: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passingYear:{
    type: DataTypes.STRING,
    allowNull:true
  },
  experience: {
    type: DataTypes.STRING,
    allowNull:true
  },
  company: {
    type: DataTypes.STRING,
    allowNull:true
  },
  city: {
    type: DataTypes.STRING,
    allowNull:true
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
  attendances: {
    type: DataTypes.JSON, 
    allowNull: true,
    defaultValue: [],//[date]
  },
  marks:{
    type:DataTypes.JSON,
    allowNull:true,
    defaultValue:JSON.stringify({'Assignments':[], 'Quizes':[]})
  },
  isEnrolled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  isValid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  assignmentAnswers:{
    type:DataTypes.JSON,
    allowNull:true,
    defaultValue:[]
    
  },
  quizAnswers:{
    type:DataTypes.JSON,
    allowNull:true,
    defaultValue:{} // {quizid:{startTime:9.30 , marks:15, answers: [{questionId1:"Not given",questionId2:"True"}} ,anotherQuizId:{...}}
    
  }
});


const findOne = async (filters = {}, attributes = null) => {
  const response = await studentsSchema.findOne({
    where: { ...filters },
    ...(attributes && { attributes }),
  });
  return response;
};

const findAll = async (filters = {}, attributes = null, limit = null, page = 1, other = null, order = [['createdAt', 'DESC'], ['updatedAt', 'DESC']]) => {
  const offset = limit ? (page - 1) * limit : null;
  const response = await studentsSchema.findAndCountAll({
    where: { ...filters },
    ...(other && other),
    ...(attributes && { attributes }),
    ...(offset && { offset }),
    ...(limit && { limit }),
    order:order
  });
  return response;
};

const create = async (data) => {
  const response = await studentsSchema.create(data);
  return response;
};

const update = async (id, data) => {
  const response = await studentsSchema.update(data, {
    where: {
      id: id,
    },
  });
  return response;
};
const destroy = async (filters) => {
  const response = await studentsSchema.destroy({
    where: {
      ...filters,
    },
  })
  return response;
};
module.exports = {
  findOne,
  findAll,
  create,
  update,
  destroy
};
