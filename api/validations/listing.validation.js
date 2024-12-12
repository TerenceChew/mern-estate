import { body, query, validationResult } from "express-validator";
import mongoose from "mongoose";

const validationResultHandler = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(422).json({ errors: result.array() });
  }

  next();
};

export const validateImages = (imgUrlsArr) => {
  const makeClarifaiApiCall = (imgUrl) => {
    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = process.env.CLARIFAI_PAT;
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = "clarifai";
    const APP_ID = "main";
    // Change these to whatever model and image URL you want to use
    const MODEL_ID = "general-image-recognition";
    const MODEL_VERSION_ID = "aa7f35c01e0642fda5cf400f543e7c40";
    const IMAGE_URL = imgUrl;

    ///////////////////////////////////////////////////////////////////////////////////
    // YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
    ///////////////////////////////////////////////////////////////////////////////////

    const raw = JSON.stringify({
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      inputs: [
        {
          data: {
            image: {
              url: IMAGE_URL,
            },
          },
        },
      ],
    });

    const requestOptions = {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Key " + PAT,
      },
      body: raw,
    };

    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id

    return fetch(
      "https://api.clarifai.com/v2/models/" +
        MODEL_ID +
        "/versions/" +
        MODEL_VERSION_ID +
        "/outputs",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        const allConcepts = result.outputs[0].data.concepts;
        const filteredConcepts = allConcepts.filter(
          (concept) =>
            concept.name === "house" ||
            concept.name === "home" ||
            concept.name === "apartment" ||
            concept.name === "indoors" ||
            concept.name === "interior design" ||
            concept.name === "room" ||
            concept.name === "villa" ||
            concept.name === "dining room"
        );

        return filteredConcepts.some((concept) => concept.value > 0.9)
          ? "Valid"
          : "Invalid";
      })
      .catch((error) => {
        console.log(error);

        return "Invalid";
      });
  };

  const validatedImgUrls = [];

  imgUrlsArr.forEach((imgUrl) => {
    validatedImgUrls.push(makeClarifaiApiCall(imgUrl));
  });

  return Promise.all(validatedImgUrls).then((results) => {
    return results.every((result) => result === "Valid") ? "Valid" : "Invalid";
  });
};

const validateCreateOrUpdateListing = [
  body("title")
    .trim()
    .isString()
    .withMessage("Title must be a string!")
    .bail()
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
    .isString()
    .withMessage("Description must be a string!")
    .bail()
    .notEmpty()
    .withMessage("Description cannot be empty!")
    .bail()
    .isLength({ min: 50 })
    .withMessage("Description must be at least 50 characters!"),
  body("address")
    .trim()
    .isString()
    .withMessage("Address must be a string!")
    .bail()
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
    .isString()
    .withMessage("Type must be a string!")
    .bail()
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
    })
    .bail()
    .custom(async (value) => {
      const result = await validateImages(value);

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
    .isString()
    .withMessage("User ref must be a string!")
    .bail()
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
    .isString()
    .withMessage("Search term must be a string!")
    .bail(),
  query("type")
    .optional()
    .trim()
    .isString()
    .withMessage("Type must be a string!")
    .bail()
    .notEmpty()
    .withMessage("Type cannot be empty!")
    .bail()
    .isIn(["all", "sale", "rent"])
    .withMessage("Invalid type value. Type must be 'all', 'sale', or 'rent'!"),
  query("parking")
    .optional()
    .trim()
    .isString()
    .withMessage("Parking must be a string!")
    .bail()
    .notEmpty()
    .withMessage("Parking cannot be empty!")
    .bail()
    .isIn(["true", "false"])
    .withMessage(
      "Invalid parking value. Parking can only be checked or unchecked!"
    ),
  query("furnished")
    .optional()
    .trim()
    .isString()
    .withMessage("Furnished must be a string!")
    .bail()
    .notEmpty()
    .withMessage("Furnished cannot be empty!")
    .bail()
    .isIn(["true", "false"])
    .withMessage(
      "Invalid furnished value. Furnished can only be checked or unchecked!"
    ),
  query("offer")
    .optional()
    .trim()
    .isString()
    .withMessage("Offer must be a string!")
    .bail()
    .notEmpty()
    .withMessage("Offer cannot be empty!")
    .bail()
    .isIn(["true", "false"])
    .withMessage(
      "Invalid offer value. Offer can only be checked or unchecked!"
    ),
  query("minPrice")
    .optional()
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
    .isString()
    .withMessage("Sort must be a string!")
    .bail()
    .notEmpty()
    .withMessage("Sort cannot be empty!")
    .bail()
    .isIn(["regularPrice", "createdAt"])
    .withMessage(
      "Invalid sort value. Sort must be 'regularPrice' or 'createdAt'!"
    ),
  query("order")
    .optional()
    .trim()
    .isString()
    .withMessage("Order must be a string!")
    .bail()
    .notEmpty()
    .withMessage("Order cannot be empty!")
    .bail()
    .isIn(["asc", "desc"])
    .withMessage("Invalid order value. Order must be 'asc' or 'desc'!"),
  query("startIndex")
    .optional()
    .trim()
    .isString()
    .withMessage("Start index must be a string!")
    .bail()
    .notEmpty()
    .withMessage("Start index cannot be empty!")
    .bail()
    .isInt()
    .withMessage(
      "Invalid start index value. Start index can only contain numbers!"
    ),
  validationResultHandler,
];
