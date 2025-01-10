import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  // validation
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username  already exists");
  }
  console.warn("req.files", req.files);
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // if (!coverImageLocalpath) {
  //   throw new ApiError(400, "Cover Image file is missing");
  // }
  // const coverImage = await uploadOnCloudinary(coverImageLocalpath);

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Avatar uploaded to cloudinary", avatar);
  } catch (err) {
    console.log("Error uploading avatar to cloudinary", err);
    throw new ApiError(500, "failed to upload avatar");
  }

  let coverImage;
  if (coverImageLocalpath) {
    try {
      coverImage = await uploadOnCloudinary(coverImageLocalpath);
      console.log("Cover Image uploaded to cloudinary", coverImage);
    } catch (err) {
      console.log("Error uploading coverImage to cloudinary", err);
      throw new ApiError(500, "failed to upload coverImage");
    }
  }

  try {
    const user = await User.create({
      fullname,
      email,
      username: username.toLowerCase(),
      password,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
    });
    //   check if user is created or not
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User created successfully"));
  } catch (error) {
    console.log("User creation failed");
    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }
    throw new ApiError(500, "User creation failed and images were deleted");
  }
});

export { registerUser };
