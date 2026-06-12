import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../model/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";


//acces and refresh generate
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user= await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.refreshToken = refreshToken
       await user.save({validateBeforeSave: false})

        return {accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something wrong while genrating access and refresh token")
    }
    
}

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

    //get details from frontend
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
    
    //upload middlewear give the more field in response, check avatar and image
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

const loginUser = asyncHandler(async (req,res) =>{
    //data from user, username&password
    //check username or email is existed or not 
    //check user is exists or not 
    //check password
    //access and refresh token generate
    //send token in cookies

    //take data from body
    const {username, email, password} = req.body
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    //find the user in db
    const user= await User.findOne({
        $or: [{username}, {email}]
    })
    if (!user) {
        throw new ApiError(404, "user is not exits")
    }

    //password check
    const isValidPassword = await user.isPasswordCorrect(password)
    if (!isValidPassword) {
        throw new ApiError(404, "Invalid user credentials")
    }

    //generate token
    const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id)

    //.select is gives us,  which fiels we don't want to send.
    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    //optins object gives our cookies secure, 
    //after these fields cookies only modified by server not ant frontend or etc.
    const options= {
        httpOnly: true,
        secure: true
    }

    //send response 
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate( //it remove token from db
        req.user._id, //we find user id by help of verifyJWT middleare. and embedded user in req
        {
            $set: { //set operator set the value
                refreshToken: undefined
            }
        },
        {
            new: true //it gives updated value
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    //clear cookie also
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logout successfully"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    //after expiry accesstoken we login user without take username&email from user
    //by the help of refreshToken

    //take refreshToken from cookie
    const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(400, "unauthorized access")
    }

    try {
        //incomingRefreshToken verify by help of jwt with the which store in db.
        const decodeToken= jwt.verify(
            incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET
        )
        if (!decodeToken) {
            throw new ApiError(400, "Invalid refresh token")
        }
    
        //find user from db by help of token
        const user= await User.findById(decodeToken?._id)
        if(!user){
            throw new ApiError(400, "Invalid user token")
        }
    
        //if user exists, check the incomingRefreshToken  and  user.refreshToken,
        //because user also store refreshToken in db if it exists give access
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(400, "Invalid user")
        }
    
        //generate both token 
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        //send res 
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed"
        )
    } catch (error) {
        throw new ApiError(400, error?.message || "Token not valid")
    }
})

const changeCurrentPassword = asyncHandler(async (req,res) => {

    const {olPassword, newPassword} = req.body
    const user = await User.findById(req.user._id)

    const isPasswordCorrrect= await user.isPasswordCorrect(olPassword)

    if(!isPasswordCorrrect){
        throw new ApiError(400, "oldpassword is wrong")
    }

    user.password = newPassword
    user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        200,
        {},
        "password change succesfully"
    )
})

const getCurrentUser = asyncHandler(async (req,res) => {
    //const user = await User.findById(req.user._id) --- by myself 
    return res
    .status(200)
    .json(200, req.user , "current user fetch successfully")
})

const updateAccountDetails = asyncHandler(async (req,res) => {
    const {fullName, email} = req.body
    if(!(fullName || email)){
        throw new ApiError(400, "all field required")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName, 
                email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        200,
        user,
        "account details updated"
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails
}