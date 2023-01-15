const jwt = require("jsonwebtoken");
const variables = require("../variables");
const User = require("../models/UsersModel");
const { isEmpty } = require("lodash");


const getToken = (authorization) => {
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

const withAuth = async (req, res, next) => {
  const authorization = req.header("authorization");
  // console.log(authorization)
  const token = getToken(authorization);
  const decodedToken = jwt.verify(token, variables.jwtSecret);
  req.user = decodedToken;
  if(decodedToken.type !='auth'){
    throw customError({
      code: 403,
      message: "Authentication",
    });
  }
  const user = await User.findOne({id:req.user.id});
  // console.log(user)
  if(isEmpty(user)){
    throw customError({
      code: 403,
      message: "Authentication",
    });
  }
  next();
};

module.exports = withAuth;
