import Listing from "../models/listing.model.js";
import { generateError } from "../utils/errorHandler.js";

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
    }).sort({
      updatedAt: "desc",
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

export const handleSearchListings = async (req, res, next) => {
  const {
    searchTerm,
    type,
    parking,
    furnished,
    offer,
    sort,
    order,
    minPrice,
    maxPrice,
    startIndex,
  } = req.query;
  const limit = req.query.limit || 9;
  const startIdx = startIndex || 0;
  const filters = {};
  const priceFilter = {
    $or: [
      {
        discountPrice: {
          $ne: null,
          $gte: minPrice || 0,
          $lte: maxPrice || 100000000,
        },
      },
      {
        discountPrice: null,
        regularPrice: {
          $gte: minPrice || 0,
          $lte: maxPrice || 100000000,
        },
      },
    ],
  };

  // prettier-ignore
  filters.type =
    type === undefined || type === "all" 
      ? { $in: ["sale", "rent"] }
      : type;

  filters.parking =
    parking === undefined || parking === "false"
      ? { $in: [true, false] }
      : parking;

  filters.furnished =
    furnished === undefined || furnished === "false"
      ? { $in: [true, false] }
      : furnished;

  // prettier-ignore
  filters.offer =
    offer === undefined || offer === "false"
      ? { $in: [true, false] }
      : offer;

  filters.title = {
    $regex: searchTerm || "",
    $options: "i",
  };

  try {
    const totalFilteredListings = await Listing.find({
      ...filters,
      ...priceFilter,
    });
    const listingsToDisplay = await Listing.find({
      ...filters,
      ...priceFilter,
    })
      .sort({
        [sort || "createdAt"]: order || "desc",
      })
      .limit(limit)
      .skip(startIdx);
    const numOfRemainingListings =
      totalFilteredListings.length - listingsToDisplay.length - startIdx;

    res
      .status(200)
      .json({ listings: listingsToDisplay, numOfRemainingListings });
  } catch (err) {
    next(err);
  }
};
