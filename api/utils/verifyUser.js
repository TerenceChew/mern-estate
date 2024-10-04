import jwt from "jsonwebtoken";
import { generateError } from "./errorHandler.js";

export const verifyJwtToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) return next(generateError(401, "Unauthorized"));

  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) return next(generateError(403, "Forbidden"));

    req.decodedUser = decoded;
    next();
  });
};
