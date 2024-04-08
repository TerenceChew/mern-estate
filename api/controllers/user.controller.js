import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import { generateError } from "../utils/error.js";
import { generateHashedPassword } from "../utils/utilities.js";
import mongoose from "mongoose";

export const handleTest = (req, res) => {
  res.json({
    message: "Test success!",
  });
};

export const handleUpdateUser = async (req, res, next) => {
  const { decodedUser, params } = req;

  if (decodedUser.id !== params.id)
    return next(generateError(401, "You can only update your own account!"));

  try {
    const user = await User.findOne({ _id: params.id });

    for (const prop in req.body) {
      if (prop === "password") {
        const hashedPassword = generateHashedPassword(req.body.password);

        user.password = hashedPassword;
      } else {
        user[prop] = req.body[prop];
      }
    }

    const updatedUser = await user.save();
    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (err) {
    if (err.code === 11000) {
      next(
        generateError(500, "User with same username or email already exist")
      );
    } else {
      next(err);
    }
  }
};

export const handleDeleteUser = async (req, res, next) => {
  const { decodedUser, params } = req;

  if (decodedUser.id !== params.id)
    return next(generateError(401, "You can only delete your own account!"));

  try {
    const listings = await Listing.find({ userRef: params.id });
    const imageUrlsToDelete = listings
      .map((listing) => listing.imageUrls)
      .flat(Infinity);
    const connection = await mongoose.connect(process.env.DATABASE_URI);
    const session = await connection.startSession();

    session.startTransaction();

    await User.deleteOne({ _id: params.id }, { session });
    await Listing.deleteMany({ userRef: params.id }, { session });
    await session.commitTransaction();
    await session.endSession();

    res
      .clearCookie("jwt", { sameSite: "none", secure: true })
      .status(200)
      .json({
        imageUrlsToDelete,
        message: "Account deleted successfully!",
      });
  } catch (err) {
    next(err);
  }
};

export const handleGetUserListings = async (req, res, next) => {
  const { decodedUser, params } = req;

  if (decodedUser.id !== params.id)
    return next(generateError(401, "You can only view your own listings!"));

  try {
    const listings = await Listing.find({ userRef: params.id }).sort({
      updatedAt: "desc",
    });

    res.status(200).json(listings);
  } catch (err) {
    next(err);
  }
};

export const handleGetUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) return next(generateError(404, "User not found!"));

    const { password, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (err) {
    next(err);
  }
};
