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
  const { decodedUser, params, body } = req;
  const currentUserId = body.id;
  const listingId = params.id;

  if (decodedUser.id !== currentUserId)
    return next(generateError(401, "You can only delete your own listing!"));

  try {
    const listingToDelete = await Listing.findOne({ _id: listingId });

    if (!listingToDelete)
      return next(
        generateError(404, "Can't delete. Listing with given ID not found!")
      );

    await Listing.deleteOne({ _id: listingId });
    const remainingListings = await Listing.find({ userRef: currentUserId });

    res.status(200).json(remainingListings);
  } catch (err) {
    next(err);
  }
};
