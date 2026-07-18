import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../model/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name){
        throw new ApiError(400, "Playlist name is required")
    }
    if(!description){
        throw new ApiError(400, "Playlist description is required")
    }

    //TODO: create playlist
   const playlist = await Playlist.create({
    name,
    description,
    user: req.user._id
   })

   if (!playlist) {
     throw new ApiError(500, "Failed to create playlist")
    }

   return res
   .status(201)
   .json(
    new ApiResponse(
        201,
        playlist,
        "Playlist created successfully"
    )
   )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId){
        throw new ApiError(400,"user ID is required")
    }
    const userPlaylist = await Playlist.aggregate(
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    )
    if(!userPlaylist?.length){
        throw new ApiError(400,"playlist is not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            userPlaylist,
            "User playlists fetched successfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId){
        throw new ApiError(400,"playlist ID is required")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"playlist is not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId || !videoId){
        throw new ApiError(400,"playlist ID and video ID are required")
    }

    const videoExists = await Video.findById(videoId)
    if(!videoExists){
        throw new ApiError(400,"Video not found")
    }
    //add video to playlist
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {videos: videoId}
        },
        {
            new:true
        }
    ) 
    if(!playlist){
        throw new ApiError(400,"Failed to add video to playlist")
    }
    // Fetch the updated playlist with populated videos
    const updatedPlaylist = await Playlist.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist[0],
            "Video added to playlist successfully"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId || !videoId){
        throw new ApiError(400,"playlistId and videoId is required")
    }
    const videoExist = await Video.findById(videoId)
    if(!videoExist){
        throw new ApiError(404,"video is not found")
    }
  
    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user_id //it can check if the playlist belongs to the user or not(check correct user)
        },
        {
            $pull:{
                videos: videoId  //pull remove the video
            }
        },
        {
            new: true
        }
    )
    if(!playlist){
        throw new ApiError(400,"playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "video is removed successfully from playlist"
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(404, "playlist is not found")
    }

    const playlist = await Playlist.findOneAndDelete(
        {
            _id: playlistId,
            owner: req.user_id
        }
    )

    if(!playlist){
        throw new ApiError(404, "playlist is not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "playlist is deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId){
        throw new ApiError(400, "playlistId is required")
    }
    if(!name && !description){
        throw new ApiError(400, "name or description is required")
    }
    //check if user send name only then update name, if user send only description then update description, if user send both then update both
    //f the client only sends name, then description becomes undefined, and vice versa.

    const updateData= {}
    if(name) updateData.name= name
    if(description) updateData.description= description

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },{
            $set: {...updateData}
        },
        {
            new: true,
            runValidators: true    //it can validate the data before updating like if name is empty or description is empty it will throw error, check minlength of name >3
        }
    )
    if(!playlist){
        throw new ApiError(404, "playlist is not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "playlist is updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}