import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title) throw new ApiError(400, "Title is required");
  if (!description) throw new ApiError(400, "Title is required");

  const localVideoPath = req.files.videoFile[0].path;
  if (!localVideoPath) throw new ApiError(400, "Video is required");
  const uploadedVideo = await uploadOnCloudinary(localVideoPath);

  const localThumbnailPath = req.files.thumbnail[0].path;
  if (!localThumbnailPath) throw new ApiError(400, "Thumbnail is required");
  const uploadedThumbnail = await uploadOnCloudinary(localThumbnailPath);

  if (!uploadedVideo || !uploadedThumbnail) {
    throw new ApiError(500, "Failed to upload video or thumbnail");
  }

  const video = await Video.create({
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
    title,
    description,
    duration: uploadedVideo.duration,
    owner: req.user?._id,
  });

  const createdVideo = await Video.findById(video._id);
  if (!createdVideo) throw new ApiError(500, "Error while publishing the user");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video registered successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "videoId is required");
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(500, "Video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const video = await Video.findById(videoId);
  if (!video.owner.toString() === req.user._id.toString()) {
    throw new ApiError(401, "only owner can update the video");
  }

  if (!videoId) throw new ApiError(400, "Video id is required");
  if (!title || !description)
    throw new ApiError(400, "Title or Description is missing");

  const localThumbnailPath = req.file?.path;
  if (!localThumbnailPath) throw new ApiError(400, "Thumbnail is required");

  const thumbnailUrl = await uploadOnCloudinary(localThumbnailPath);

  const updatedThumbnail = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnailUrl.url,
      },
    },
    { new: true }
  );

  if (!updatedThumbnail) {
    throw new ApiError(500, "Failed to update video descrption or title");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedThumbnail,
        "Video details updated successfully"
      )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "videoId is required");
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  const video = await Video.findByIdAndDelete(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "videoId is required");
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const updatedVideoToggle = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideoToggle, "Toggled successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
