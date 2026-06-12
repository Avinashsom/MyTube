import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

//it find user is authenticate or not 
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        //req also handle cookie, so take user which one logout its middleware
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token){
            throw new ApiError(400,"unauthorized access")
        }
        //verify by jwt 
        const decodeToken= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //from all these 3 step is only to find user which one is it for eg(logout)
        const user= await User.findById(decodeToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"Invalid access token")
        }

        req.user= user
        next()
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid token")
    }
})