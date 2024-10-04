import { validationResult } from "express-validator";
import { performImageRecognition } from "./clarifai.js";

const validationResultHandler = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(422).json({ errors: result.array() });
  }

  next();
};

const isValidListingImg = (concept) => {
  const validConcepts = [
    "house",
    "home",
    "apartment",
    "indoors",
    "interior design",
    "room",
    "villa",
    "dining room",
  ];

  return validConcepts.includes(concept.name) && concept.value > 0.9;
};

const validateListingImages = (imgUrlsArr) => {
  const validatedImgUrls = imgUrlsArr.map((imgUrl) => {
    return performImageRecognition(imgUrl)
      .then((response) => response.json())
      .then((result) => {
        const allConcepts = result.outputs[0].data.concepts;

        return allConcepts.some(isValidListingImg) ? "Valid" : "Invalid";
      })
      .catch((error) => {
        console.log(error);

        return "Invalid";
      });
  });

  return Promise.all(validatedImgUrls).then((results) => {
    return results.every((result) => result === "Valid") ? "Valid" : "Invalid";
  });
};

export { validationResultHandler, validateListingImages };
