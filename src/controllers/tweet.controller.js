import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const owner = req.user._id;
  if (!content) throw new ApiError(400, "content is required");

  if (!isValidObjectId(owner)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const tweet = await Tweet.create({
    content,
    owner,
  });

  const createdTweet = await Tweet.findById(tweet?._id);
  if (!createdTweet)
    throw new ApiError(500, "Something went wrong while creating the tweet");
  return res
    .status(200)
    .json(new ApiResponse(200, createdTweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) throw new ApiError(400, "User is missing");

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  if (!tweets) {
    throw new ApiError(400, "No tweet found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId) throw new ApiError(400, "Tweet Id is Required");

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) throw new ApiError(400, "Tweet Id is Required");

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
  if (!deletedTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
