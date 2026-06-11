import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../model/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res) =>{
    //get user details from frontend
    //validation -- not empty
    //check user alreaady exits: username,email
    //check for images and check for avatar
    //upload them to cloudinary --- check for avatar
    //create user object -- create entry in db
    //password and refresh token remove from response
    //check user creation
    //return res

    const{fullName, email, username, password} = req.body
    console.log("email:", email);

    if (
        [fullName, email, username, password].some(field => field?.trim() ===""
        )
    ) {
        throw new ApiError(400, "All field are required")
    }

    const existedUser= await User.findOne({
        $or: [{username}, {email}]  // $or operator is help to find same email and username
    })
    if (existedUser) {
        throw new ApiError(400, "user with email and username already exists")
    }
    
    //upload middlewear give the more field i response, check avatar and image
    const avatarLocalPath= req.files?.avatar?.[0]?.path;
    const coverImageLocalPath= req.files?.coverImage?.[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar is required multer")
    }

    //upload images on cloudinary 
    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "avatar is required cloudiary")
    }

    //create and enter in db
    const user= await User.create(
        {
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        }
    )
    
    //remove password and refreshtoken
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "something went wrong while register the user")
    }

    // send response back
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user is created succesfully")
    )
})

export {registerUser}