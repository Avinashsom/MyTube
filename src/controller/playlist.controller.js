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
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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