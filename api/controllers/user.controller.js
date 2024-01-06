import User from "../models/user.model.js";
import { generateError } from "../utils/error.js";
import { generateHashedPassword } from "../utils/utilities.js";

export const handleTest = (req, res) => {
  res.json({
    message: "Test success!",
  });
};

export const handleUserUpdate = async (req, res, next) => {
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
    next(err);
  }
};

export const handleUserDelete = async (req, res, next) => {
  const { decodedUser, params } = req;

  if (decodedUser.id !== params.id)
    return next(generateError(401, "You can only delete your own account!"));

  try {
    await User.deleteOne({ _id: params.id });

    res.clearCookie("jwt").status(200).json("Account deleted successfully!");
  } catch (err) {
    next(err);
  }
};
