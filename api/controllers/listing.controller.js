import Listing from "../models/listing.model.js";
import { generateError } from "../utils/error.js";

export const handleCreateListing = async (req, res, next) => {
  try {
    const newListing = new Listing(req.body);

    await newListing.save();

    res.status(201).json(newListing);
  } catch (err) {
    next(err);
  }
};

export const handleDeleteListing = async (req, res, next) => {
  const { decodedUser, params } = req;
  const listingId = params.id;

  try {
    const listingToDelete = await Listing.findOne({ _id: listingId });

    if (!listingToDelete)
      return next(
        generateError(404, "Can't delete. Listing with given ID not found!")
      );

    if (decodedUser.id !== listingToDelete.userRef)
      return next(generateError(401, "You can only delete your own listing!"));

    await Listing.deleteOne({ _id: listingId });

    const remainingListings = await Listing.find({
      userRef: listingToDelete.userRef,
    });

    res.status(200).json(remainingListings);
  } catch (err) {
    next(err);
  }
};

export const handleUpdateListing = async (req, res, next) => {
  const { decodedUser, params, body } = req;
  const listingId = params.id;

  try {
    const listingToUpdate = await Listing.findOne({ _id: listingId });

    if (!listingToUpdate)
      return next(
        generateError(404, "Can't update. Listing with given ID not found!")
      );

    if (decodedUser.id !== listingToUpdate.userRef)
      return next(generateError(401, "You can only update your own listing!"));

    for (const prop in body) {
      listingToUpdate[prop] = body[prop];
    }

    const updatedListing = await listingToUpdate.save();

    res.status(200).json(updatedListing);
  } catch (err) {
    next(err);
  }
};

export const handleGetListing = async (req, res, next) => {
  const listingId = req.params.id;

  try {
    const listingToGet = await Listing.findOne({ _id: listingId });

    if (!listingToGet)
      return next(generateError(404, "Listing with given ID not found!"));

    res.status(200).json(listingToGet);
  } catch (err) {
    next(err);
  }
};
