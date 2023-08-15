const { sequelize, DataTypes } = require("../config");

const videoSchema = sequelize.define("recordedvideos", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      courseId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      batch: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      video_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      classType: {
        type: DataTypes.STRING,
        allowNull: false,
      }
});

const findOne = async (filters = {}, attributes = null) => {
    const response = await videoSchema.findOne({
      where: { ...filters },
      ...(attributes && { attributes }),
    });
    return response;
  };
  
  const findAll = async (filters = {}, attributes = null, limit = null, page = 1, order = [['createdAt', 'DESC'], ['updatedAt', 'DESC']]) => {
    const offset = limit ? (page - 1) * limit : null;
    //return data in descending order
    const response = await videoSchema.findAndCountAll({
      where: { ...filters },
      ...(attributes && { attributes }),
      ...(offset && { offset }),
      ...(limit && { limit }),
      order: order,
    });
    return response;
  };
  
  const create = async (data) => {
    const response = await videoSchema.create(data);
    return response;
  };
  
  const update = async (id, data) => {
    // console.log(id)
    // console.log(data)
    const response = await videoSchema.update(data, {
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
    const response = await videoSchema.destroy({
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
  
