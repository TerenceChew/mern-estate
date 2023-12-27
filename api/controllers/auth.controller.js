import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const handleSignUp = async (req, res) => {
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
    res.status(500).json(err.message);
  }
};
