const { customError } = require("../utils");
const { findOne, findAll, create, update, destroy } = require("./../models/ExpenseModel");
const { Op } = require("sequelize");

const getExpenseByCourseId = async (req, res) => {
  
};

const getPublicExpense = async (req, res) => {
  
};

const getExpensesByDate = async (req, res) => {
  try {
    const filters = req.query || {};
  
    const endDate = filters?.end_date ? new Date(filters.end_date) : new Date();
    const startDate = filters?.start_date ? new Date(filters.start_date) : new Date();
  
    // Check if both start_date and end_date are provided to apply the date filter
    const dateFilter = filters.start_date && filters.end_date
      ? {
          date: {
            [Op.between]: [startDate, endDate],
          },
      }
      : {}; // If not, use an empty filter to show all expenses
  
    const response = await findAll(dateFilter);
  
    if (response.count === 0) {
      res.status(404).send({
        error: "No expense found within the specified date range",
      });
    } else {
      res.status(200).send({
        message: "Expense fetched successfully",
        count: response.count,
        data: response.rows,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: "Internal Server Error",
    });
  }
};


const getPublicExpenses = async (req, res) => {
  const filters = req.query || {};
  const response = await findAll();

  if (response.count === 0) {
    throw customError({
      code: 404,
      message: "No expense found",
    });
  }
  res.status(200).send({
    message: "Expense fetched successfully",
    count: response.count,
    data: response.rows,
  });
};


const getExpense = async (req, res) => {
  const { id } = req.params;
  const response = await findOne({ id });

  if (!response) {
    throw customError({
      code: 404,
      message: "Expense not found",
    });
  }
  res.status(200).send({
    message: "Expense fetched successfully",
    data: response,
  });
};

const getAllExpenses = async (req, res) => {
  const filters = req.query || {};
  const response = await findAll(filters);

  if (response.count === 0) {
    throw customError({
      code: 404,
      message: "No expense found",
    });
  }

  res.status(200).send({
    message: "expense fetched successfully",
    count: response.count,
    data: response.rows,
  });
};


const addExpense = async (req, res) => {
  const response = await create({ ...req.body });
  res.status(201).send({
    message: "Expense added successfully",
    data: response,
  });
};


const destroyExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await findOne({ id });

    if (!expense) {
      throw customError({
        code: 404,
        message: "Expense not found",
      });
    }

    await destroy({ id });
    res.status(200).send({
      message: "Expense deleted successfully",
    });
  } catch (err) {
    throw customError({
      code: 500,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getExpenseByCourseId,
  getPublicExpense,
  getExpensesByDate,
  getPublicExpenses,
  getExpense,
  getAllExpenses,
  addExpense,
  destroyExpense,
};
