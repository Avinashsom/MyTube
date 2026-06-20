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
    //get video from req.params and comment from req.body
    //create a new comment with commentText, videoId and userId
    //save comment in db
    //return res with created comment

    const {videoId}= req.params
    if(!videoId){
        throw new ApiError(400, "video url is not valid")
    }

    const {commentText} = req.body
    if(!commentText){
        throw new ApiError(400, "commentText is required")
    }

    //we also create a new comment by the help of aggregate pipeline instead of .create()

    const comment = await Comment.create({
        content: commentText,
        video: videoId,
        owner: req.user._id
    })
    
    // but it return array instead of document
    // const comment = await Comment.aggregate([
    //     {
    //         $match:{
    //             video: videoId
    //         }
    //     },
    //     {   //it can perform mongo .create() opration crud opration.
    //         $push:{
    //             content: commentText,
    //             video: videoId,
    //             owner: req.user._id
    //         }
    //     }
    // ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "comment is added successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    //get commentId
    //update the comment in db and save
    //return res

    const {commentId} = req.params
    if(!commentId){
        throw new ApiError(400, "authentication is required")
    }

    const {commentText} = req.body
    if(!commentText){
        throw new ApiError(400, "comment text is required")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content: commentText
            }
        },
        {
            new:true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "comment is updated successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if(!commentId){
        throw new ApiError(400, "commentId is required")
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "comment not found")
    }
    //it can check if the comment owner is the same as the user who is trying to delete the comment.
    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {commentId},
            "comment is deleted successfully"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }