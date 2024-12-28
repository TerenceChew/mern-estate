import { performImageRecognition } from "../clarifai/imageRecognition";

const validateCreateOrUpdateListing = (formData) => {
  const errors = {};
  const urlRegex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,10}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
  const {
    title,
    description,
    address,
    type,
    parking,
    furnished,
    offer,
    bedrooms,
    bathrooms,
    regularPrice,
    discountPrice,
    imageUrls,
  } = formData;

  if (!title) {
    errors.title = "Title cannot be empty!";
  } else if (title.length < 20) {
    errors.title = "Title must be at least 20 characters!";
  } else if (title.length > 60) {
    errors.title = "Title cannot be more than 60 characters!";
  }

  if (!description) {
    errors.description = "Description cannot be empty!";
  } else if (description.length < 50) {
    errors.description = "Description must be at least 50 characters!";
  }

  if (!address) {
    errors.address = "Address cannot be empty!";
  } else if (address.length < 15) {
    errors.address = "Address must be at least 15 characters!";
  } else if (address.length > 60) {
    errors.address = "Address cannot be more than 60 characters!";
  }

  if (!type) {
    errors.type = "Please choose sale or rent!";
  } else if (!["rent", "sale"].includes(type)) {
    errors.type = "Type must be sale or rent!";
  }

  if (typeof parking !== "boolean") {
    errors.parking =
      "Invalid parking value. Parking can only be checked or unchecked!";
  }

  if (typeof furnished !== "boolean") {
    errors.furnished =
      "Invalid furnished value. Furnished can only be checked or unchecked!";
  }

  if (typeof offer !== "boolean") {
    errors.offer =
      "Invalid offer value. Offer can only be checked or unchecked!";
  }

  if (!bedrooms || bedrooms < 1) {
    errors.bedrooms = "There must be at least 1 bedroom!";
  } else if (bedrooms > 20) {
    errors.bedrooms = "There cannot be more than 20 bedrooms!";
  }

  if (!bathrooms || bathrooms < 1) {
    errors.bathrooms = "There must be at least 1 bathroom!";
  } else if (bathrooms > 20) {
    errors.bathrooms = "There cannot be more than 20 bathrooms!";
  }

  if (!Number.isInteger(regularPrice)) {
    errors.regularPrice = "Please enter a regular price!";
  } else if (regularPrice < 50) {
    errors.regularPrice = "Regular price must be at least 50!";
  } else if (regularPrice > 100000000) {
    errors.regularPrice = "Regular price cannot be more than 100,000,000!";
  }

  if (offer) {
    if (!Number.isInteger(discountPrice)) {
      errors.discountPrice = "Please enter a discount price for your offer!";
    } else if (discountPrice < 0) {
      errors.discountPrice = "Discount price cannot be less than 0!";
    } else if (discountPrice >= regularPrice) {
      errors.discountPrice =
        "Discount price must be less than the regular price!";
    }
  }

  if (!imageUrls.length) {
    errors.imageUrls = "A listing must have at least 1 image!";
  } else if (!imageUrls.every((url) => urlRegex.test(url))) {
    errors.imageUrls = "Invalid image URL(s) found!";
  }

  return errors;
};

const validateListingImages = (imgUrlsArr) => {
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

  return Promise.all(validatedImgUrls);
};

const validateSearchListings = (formData) => {
  const errors = {};
  const {
    searchTerm,
    type,
    offer,
    parking,
    furnished,
    minPrice,
    maxPrice,
    sort,
    order,
  } = formData;

  if (typeof searchTerm !== "string") {
    errors.searchTerm = "Search term must be a string!";
  }

  if (!["all", "sale", "rent"].includes(type)) {
    errors.type = "Invalid type value. Type must be 'all', 'sale', or 'rent'!";
  }

  if (typeof offer !== "boolean") {
    errors.offer =
      "Invalid offer value. Offer can only be checked or unchecked!";
  }

  if (typeof parking !== "boolean") {
    errors.parking =
      "Invalid parking value. Parking can only be checked or unchecked!";
  }

  if (typeof furnished !== "boolean") {
    errors.furnished =
      "Invalid furnished value. Furnished can only be checked or unchecked!";
  }

  if (!Number.isInteger(minPrice)) {
    errors.minPrice = "Please enter a min price!";
  } else if (minPrice < 0) {
    errors.minPrice = "Min price cannot be lower than 0!";
  } else if (minPrice >= maxPrice) {
    errors.minPrice = "Min price must be less than max price!";
  }

  if (!Number.isInteger(maxPrice)) {
    errors.maxPrice = "Please enter a max price!";
  } else if (maxPrice <= minPrice) {
    errors.maxPrice = "Max price must be more than min price!";
  } else if (maxPrice > 100000000) {
    errors.maxPrice = "Max price cannot exceed 100,000,000!";
  }

  if (!["regularPrice", "createdAt"].includes(sort)) {
    errors.sort =
      "Invalid sort value. Sort must be 'regularPrice' or 'createdAt'!";
  }

  if (!["asc", "desc"].includes(order)) {
    errors.order = "Invalid order value. Order must be 'asc' or 'desc'!";
  }

  return errors;
};

export {
  validateCreateOrUpdateListing,
  validateListingImages,
  validateSearchListings,
};
