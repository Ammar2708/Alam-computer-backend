import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const cloudName = process.env.CLOUDINARY_NAME || "danuo8rbo";
const apiKey = process.env.CLOUDINARY_API_KEY || "862783974426133"; 
const apiSecret = process.env.CLOUDINARY_API_SECRET || "hKedawfMgL2QMRZDloJ9MC8gA5o";

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