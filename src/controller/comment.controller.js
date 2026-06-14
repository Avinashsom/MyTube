import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

   //now we find all comments for the video
   //it is populate options , we also use aggregate pipeline to get the comments for the video, we can also use normal query but it is not efficient, so we use aggregate pipeline to get the comments for the video
   const comments = await Comment.find({videoId: videoId})
   .skip((page - 1) * limit)
   .limit(limit)
   .sort({createdAt: -1})

   // return the comments in a paginated format
   const totalComment = await Comment.countDocuments({videoId: videoId})
   const totalPages = Math.ceil(totalComment / limit)

   return res
   .status(200)
   .json(
    new ApiResponse(
        200,
        {comments, totalPages, currentPage: page},
        "Comments retrieved successfully"
    )
   )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }