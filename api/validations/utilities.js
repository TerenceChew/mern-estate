import { validationResult } from "express-validator";
import { performImageRecognition } from "./clarifai.js";

const validationResultHandler = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(422).json({ errors: result.array() });
  }

  next();
};

const validateListingImages = (imgUrlsArr) => {
  const validatedImgUrls = imgUrlsArr.map((imgUrl) => {
    return performImageRecognition(imgUrl)
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
  });

  return Promise.all(validatedImgUrls).then((results) => {
    return results.every((result) => result === "Valid") ? "Valid" : "Invalid";
  });
};

export { validationResultHandler, validateListingImages };
