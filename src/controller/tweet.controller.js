import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../model/tweet.model.js"
import {User} from "../model/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content){
        throw new ApiError(400,"Content is required");
    }
    const tweet = await Tweet.create({
        content,
        user: req.user._id
    });
    if(!tweet){
        throw new ApiError(500,"Failed to create tweet");
    }
    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            tweet,
            "Tweet created successfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id");
    }
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404,"User not found");
    }
    const tweets = await Tweet.find({user: userId}).sort({createdAt: -1});    //sort for latest tweet show upper
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweets,
            "User tweets fetched successfully"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}