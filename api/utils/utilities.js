import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateDefaultPassword = () => {
  const left = Math.random().toString(36).slice(-8);
  const right = Math.random().toString(36).slice(-8);

  return left + right;
};

const generateUniqueUsername = (username) => {
  return username + Math.random().toString(36).slice(-5);
};

const generateHashedPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  return hashedPassword;
};

const generateJwtToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET);

export {
  generateDefaultPassword,
  generateUniqueUsername,
  generateHashedPassword,
  generateJwtToken,
};
