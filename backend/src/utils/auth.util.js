import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const hashpassword = async (plainpassword) => {
    return await bcrypt.hash(plainpassword, 10)
}

export const isPasswordMatch = async (enteredPasword, HashedPassword) => {
    return await bcrypt.compare(enteredPasword, HashedPassword)
}

export const GenerateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    });
}

export const GenerateRefreshToken = (UserId) =>{
    return jwt.sign({ id: UserId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    }); 
}