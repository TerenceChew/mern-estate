import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateError } from "../utils/error.js";
import {
  generateDefaultPassword,
  generateUniqueUsername,
} from "../utils/utilities.js";
import jwt from "jsonwebtoken";

export const handleSignUp = async (req, res, next) => {
  const { username, email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  try {
    const result = await newUser.save();

    res.status(201).json(result);
  } catch (err) {
    next(err);
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
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
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;

      res.cookie("jwt", token, { httpOnly: true }).status(200).json(rest);
    } else {
      const defaultPassword = generateDefaultPassword();
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(defaultPassword, salt);
      const uniqueUsername = generateUniqueUsername(username);
      const newUser = new User({
        username: uniqueUsername,
        email,
        password: hashedPassword,
        photoURL,
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;

      res.cookie("jwt", token, { httpOnly: true }).status(200).json(rest);
    }
  } catch (err) {
    next(err);
  }
};
