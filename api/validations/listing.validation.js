import { body, validationResult } from "express-validator";
import mongoose from "mongoose";

export const validateCreateListing = [
  body("title")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Title cannot be empty!")
    .bail()
    .isLength({ min: 20 })
    .withMessage("Title must be at least 20 characters!")
    .bail()
    .isLength({ max: 60 })
    .withMessage("Title cannot be more than 60 characters!"),
  body("description")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Description cannot be empty!")
    .bail()
    .isLength({ min: 50 })
    .withMessage("Description must be at least 50 characters!"),
  body("address")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Address cannot be empty!")
    .bail()
    .isLength({ min: 15 })
    .withMessage("Address must be at least 15 characters!")
    .bail()
    .isLength({ max: 60 })
    .withMessage("Address cannot be more than 60 characters!"),
  body("type")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please choose sale or rent!")
    .bail()
    .isIn(["sale", "rent"])
    .withMessage("Invalid type value. Type must be sale or rent!"),
  body("parking")
    .isBoolean({ strict: true })
    .withMessage(
      "Invalid parking value. Parking can only be checked or unchecked!"
    ),
  body("furnished")
    .isBoolean({ strict: true })
    .withMessage(
      "Invalid furnished value. Furnished can only be checked or unchecked!"
    ),
  body("offer")
    .isBoolean({ strict: true })
    .withMessage(
      "Invalid offer value. Offer can only be checked or unchecked!"
    ),
  body("bedrooms")
    .isInt()
    .withMessage("Invalid bedrooms value. Bedrooms must be a number!")
    .bail()
    .isInt({ min: 1 })
    .withMessage("There must be at least 1 bedroom!")
    .bail()
    .isInt({ max: 20 })
    .withMessage("There cannot be more than 20 bedrooms!"),
  body("bathrooms")
    .isInt()
    .withMessage("Invalid bathrooms value. Bathrooms must be a number!")
    .bail()
    .isInt({ min: 1 })
    .withMessage("There must be at least 1 bathroom!")
    .bail()
    .isInt({ max: 20 })
    .withMessage("There cannot be more than 20 bathrooms!"),
  body("regularPrice")
    .isInt()
    .withMessage("Invalid regular price value. Regular price must be a number!")
    .bail()
    .isInt({ min: 50 })
    .withMessage("Regular price must be at least 50!")
    .bail()
    .isInt({ max: 100000000 })
    .withMessage("Regular price cannot be more than 100,000,000!"),
  body("discountPrice").custom((value, { req }) => {
    if (req.body.offer) {
      if (!Number.isInteger(value)) {
        throw new Error(
          "Invalid discount price value. Discount price must be a number!"
        );
      } else if (value < 0) {
        throw new Error("Discount price cannot be less than 0!");
      } else if (value >= req.body.regularPrice) {
        throw new Error("Discount price must be less than the regular price!");
      }
    } else {
      if (value !== null)
        throw new Error(
          "Invalid discount price value. Discount price must be null if there is no offer!"
        );
    }

    return true;
  }),
  body("imageUrls")
    .isArray({ min: 1 })
    .withMessage("A listing must have at least 1 image!")
    .bail()
    .isArray({ max: 6 })
    .withMessage("A listing can only have a maximum of 6 images!")
    .bail()
    .custom((value) => {
      const urlRegex =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
      const isValidUrl = (url) => urlRegex.test(url);

      if (!value.every(isValidUrl)) {
        throw new Error("Invalid image URL(s) found!");
      }

      return true;
    }),
  body("userRef")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("User ref cannot be empty!")
    .bail()
    .custom((value) => {
      if (!mongoose.isValidObjectId(value)) {
        throw new Error(
          "Invalid user ref value. User ref must be a MongoDB ObjectId!"
        );
      }

      return true;
    }),
  (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    next();
  },
];
