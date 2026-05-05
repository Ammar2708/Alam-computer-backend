import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const cloudName = process.env.CLOUDINARY_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const storage = multer.memoryStorage();

async function imageUploadUtil(file) {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials not found");
  }

  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return result;
}

const upload = multer({ storage });

export { upload, imageUploadUtil };
