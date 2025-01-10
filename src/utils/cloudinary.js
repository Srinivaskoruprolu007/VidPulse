import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    // console.log("Cloudinary Config : ", {
    //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //   api_key: process.env.CLOUDINARY_API_KEY,
    //   api_secret: process.env.CLOUDINARY_API_SECRET,
    // });
    if (!localFilePath) return;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(`File uploaded successfully at ${response.url}`);
    // once the file is uploaded, we can delete the file from the servers
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("Error uploading file to cloudinary", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    const response = await cloudinary.uploader.destroy(publicId);
    console.log(`File deleted successfully from cloudinary`);
    return response;
  } catch (error) {
    console.log("Error deleting file from cloudinary", error);
    return null;
  }
};

export { uploadOnCloudinary };
