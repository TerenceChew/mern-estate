import { body, validationResult } from "express-validator";

export const validateUpdateUser = [
  body("username")
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
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Email cannot be empty!")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email!"),
  body("password")
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
  (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    next();
  },
];
