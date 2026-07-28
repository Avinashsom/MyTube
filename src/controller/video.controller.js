import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../model/video.model.js"
import { User } from "../model/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    //convert page and limit into number, beacuse req.query ssend string
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));

    //create a filter object
    const filter = {}
    // - If query exists, search by video title/description using regex.
    if (query?.trim()) {
        filter.$or = [ //or can find if any one condition is true
            {
                title: {
                    $regex: query.trim(),   //regex can help to find document where title is "chai"
                    $options: "i"           //options: "i" is for case sensitive when we search chai, so i also find CHAI name document as well
                },
                description: {
                    $regex: query.trim(),
                    $options: "i"
                },
            }
        ];
    }
    // - If userId exists, filter videos uploaded by that user.
    if (userId) {
        filter.owner(userId);
    }
    // - Only include published videos if required.
    filter.isPublished = true;

    // Step 4: Create a sort object.
    const sort = {};
    //sortBy is user give sort by title
    if (sortBy) {
        sort[sortBy] = sortType === "asc" ? 1 : -1;
    } else {
        // Default sorting: newest videos first
        sort.createdAt = -1;
    }

    //Calculate pagination values.
    const skip = (page - 1) * limit;

    // Step 6: Query the database.
    const videos = await Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("owner", "username avatar");


    //count total document   
    const totalVideo = await Video.countDocuments(filter);

    // Step 8: Create pagination metadata.for sending to frontend
    const totalPages = Math.ceil(totalVideos / limit);

    const pagination = {
        currentPage: page,
        totalPages,
        totalVideos,
        limit: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };

    // Step 9: Send success response.
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    videos,
                    pagination
                },
                "Videos fetched successfully"
            )
    );


})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}