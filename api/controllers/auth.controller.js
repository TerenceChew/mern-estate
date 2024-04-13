import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateError } from "../utils/error.js";
import {
  generateDefaultPassword,
  generateUniqueUsername,
  generateHashedPassword,
  generateJwtToken,
} from "../utils/utilities.js";

export const handleSignUp = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = generateHashedPassword(password);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save();

    res.status(201).json("Sign Up Success");
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

export const handleSignIn = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return next(generateError(404, "User Not Found!"));

    const hash = user.password;
    const passwordIsValid = bcrypt.compareSync(password, hash);

    if (!passwordIsValid) return next(generateError(401, "Wrong Credentials!"));

    const token = generateJwtToken(user._id);
    const { password: pass, ...rest } = user._doc;

    res.cookie("jwt", token, { httpOnly: true }).status(200).json(rest);
  } catch (err) {
    next(err);
  }
};

export const handleGoogleSignIn = async (req, res, next) => {
  const { username, email, photoURL } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const token = generateJwtToken(user._id);
      const { password: pass, ...rest } = user._doc;

      res.cookie("jwt", token, { httpOnly: true }).status(200).json(rest);
    } else {
      const defaultPassword = generateDefaultPassword();
      const hashedPassword = generateHashedPassword(defaultPassword);
      const uniqueUsername = generateUniqueUsername(username);
      const newUser = new User({
        username: uniqueUsername,
        email,
        password: hashedPassword,
        photoURL,
      });

      await newUser.save();

      const token = generateJwtToken(newUser._id);
      const { password: pass, ...rest } = newUser._doc;

      res.cookie("jwt", token, { httpOnly: true }).status(200).json(rest);
    }
  } catch (err) {
    next(err);
  }
};

export const handleSignOut = (req, res, next) => {
  try {
    res.clearCookie("jwt").status(200).json("User has been logged out!");
  } catch (err) {
    next(err);
  }
};
