const {sequelize, DataTypes} = require("../config");

const quizesSchema = sequelize.define("quizes", {
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
     *  type: "text" | 'mcq' | 'boolean',
     *  question: question,
     *  answer: answer
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
    quizStartDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    quizEndDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    maxQues: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    totalTime: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

const findOne = async (filters = {}, attributes = null) => {
    // console.log(filters)
    return await quizesSchema.findOne({
        where: {...filters},
        ...(attributes && {attributes}),
    });
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
  return await quizesSchema.findAndCountAll({
      where: {...filters},
      ...(attributes && {attributes}),
      ...(offset && {offset}),
      ...(limit && {limit}),
      order: order,
    });
};

const create = async (data) => {
  return quizesSchema.create(data);
};

const update = async (id, data) => {
  return await quizesSchema.update(data, {
      where: {
        id: id,
      },
    });
};
const destroy = async (...filters) => {
  return await quizesSchema.destroy({
      where: {
        ...filters,
      },
    });
};
module.exports = {
    findOne,
    findAll,
    create,
    update,
    destroy
};
