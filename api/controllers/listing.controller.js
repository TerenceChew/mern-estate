import Listing from "../models/listing.model.js";

export const handleCreateListing = async (req, res, next) => {
  try {
    const newListing = new Listing(req.body);

    await newListing.save();

    res.status(201).json(newListing);
  } catch (err) {
    next(err);
  }
};
