import { body, query } from "express-validator";
import mongoose from "mongoose";
import {
  validationResultHandler,
  isValidUrl,
  validateListingImages,
} from "./utilities.js";

const validateCreateOrUpdateListing = [
  body("title")
    .trim()
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
    .notEmpty()
    .withMessage("Description cannot be empty!")
    .bail()
    .isLength({ min: 50 })
    .withMessage("Description must be at least 50 characters!")
    .bail()
    .isLength({ max: 2000 })
    .withMessage("Description cannot be more than 2,000 characters!"),
  body("address")
    .trim()
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
    .custom((imgUrls) => {
      if (!imgUrls.every(isValidUrl)) {
        throw new Error("Invalid image URL(s) found!");
      }

      return true;
    })
    .bail()
    .custom(async (imgUrls) => {
      const result = await validateListingImages(imgUrls);

      if (result === "Invalid") {
        throw new Error(
          "Invalid image(s) found! Make sure each image is an appropriate property image!"
        );
      }
    }),
];

export const validateCreateListing = [
  ...validateCreateOrUpdateListing,
  body("userRef")
    .trim()
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
  validationResultHandler,
];

export const validateUpdateListing = [
  ...validateCreateOrUpdateListing,
  validationResultHandler,
];

export const validateSearchListings = [
  query("searchTerm")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search term cannot be more than 100 characters!"),
  query("type")
    .optional()
    .trim()
    .isIn(["all", "sale", "rent"])
    .withMessage("Invalid type value. Type must be 'all', 'sale', or 'rent'!"),
  query("parking")
    .optional()
    .trim()
    .isIn(["true", "false"])
    .withMessage(
      "Invalid parking value. Parking can only be checked or unchecked!"
    ),
  query("furnished")
    .optional()
    .trim()
    .isIn(["true", "false"])
    .withMessage(
      "Invalid furnished value. Furnished can only be checked or unchecked!"
    ),
  query("offer")
    .optional()
    .trim()
    .isIn(["true", "false"])
    .withMessage(
      "Invalid offer value. Offer can only be checked or unchecked!"
    ),
  query("minPrice")
    .optional()
    .trim()
    .isInt()
    .withMessage("Invalid min price value. Min price must be a number!")
    .bail()
    .isInt({ min: 0 })
    .withMessage("Min price cannot be lower than 0!")
    .bail()
    .isInt({ max: 100000000 })
    .withMessage("Min price cannot be more than 100,000,000!")
    .bail()
    .custom((value, { req }) => {
      const { maxPrice } = req.query;

      if (Number(value) >= Number(maxPrice)) {
        throw new Error("Min price must be less than max price!");
      }

      return true;
    }),
  query("maxPrice")
    .optional()
    .trim()
    .isInt()
    .withMessage("Invalid max price value. Max price must be a number!")
    .bail()
    .isInt({ min: 0 })
    .withMessage("Max price cannot be lower than 0!")
    .bail()
    .isInt({ max: 100000000 })
    .withMessage("Max price cannot be more than 100,000,000!")
    .bail()
    .custom((value, { req }) => {
      const { minPrice } = req.query;

      if (Number(value) <= Number(minPrice)) {
        throw new Error("Max price must be more than min price!");
      }

      return true;
    }),
  query("sort")
    .optional()
    .trim()
    .isIn(["regularPrice", "createdAt"])
    .withMessage(
      "Invalid sort value. Sort must be 'regularPrice' or 'createdAt'!"
    ),
  query("order")
    .optional()
    .trim()
    .isIn(["asc", "desc"])
    .withMessage("Invalid order value. Order must be 'asc' or 'desc'!"),
  query("startIndex")
    .optional()
    .trim()
    .isInt()
    .withMessage("Invalid start index value. Start index must be a number!")
    .bail()
    .isInt({ min: 0 })
    .withMessage("Start index cannot be lower than 0!")
    .bail()
    .isInt({ max: 10000 })
    .withMessage("Start index cannot be more than 10,000!"),
  validationResultHandler,
];
