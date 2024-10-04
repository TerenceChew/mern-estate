import { body } from "express-validator";
import { validationResultHandler } from "./utilities.js";

export const validateUpdateUser = [
  body("username")
    .isString()
    .withMessage("Username must be a string!")
    .bail()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Username cannot be empty!")
    .bail()
    .isLength({ min: 5 })
    .withMessage("Username must be at least 5 characters!")
    .bail()
    .isLength({ max: 20 })
    .withMessage("Username cannot be more than 20 characters!"),
  body("email")
    .isString()
    .withMessage("Email must be a string!")
    .bail()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Email cannot be empty!")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email!"),
  body("password")
    .isString()
    .withMessage("Password must be a string!")
    .bail()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Password cannot be empty!")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters!")
    .bail()
    .isLength({ max: 16 })
    .withMessage("Password cannot be more than 16 characters!")
    .bail()
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/)
    .withMessage(
      "Password must contain at least 1 digit, 1 uppercase and 1 lowercase letter!"
    ),
  body("passwordConfirmation")
    .isString()
    .withMessage("Password confirmation must be a string!")
    .bail()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Password confirmation cannot be empty!")
    .bail()
    .custom((value, { req }) => {
      const { password } = req.body;

      if (value !== password) {
        throw new Error("Does not match password!");
      }

      return true;
    }),
  validationResultHandler,
];
