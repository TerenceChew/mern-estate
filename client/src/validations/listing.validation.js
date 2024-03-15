export const validate = (formData) => {
  const errors = {};
  const urlRegex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
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
