import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, 10);
};

const isPasswordMatch = async (enteredPassword, hashedPassword) => {
  return bcrypt.compare(enteredPassword, hashedPassword);
};

const GenerateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const GenerateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET,{
    expiresIn:"100d"
  });
};

export const options = {
  httpOnly: true,
  secure: true,
  sameSite: "strict"
};

export {
  hashPassword,
  isPasswordMatch,
  GenerateAccessToken,
  GenerateRefreshToken,
};
