import express from "express";
import {
  getAllActiveSliders,
  getAllSlidersForAdmin,
  createSlider,
  updateSlider,
  deleteSlider,
  getSingleSlider,
  handleSliderImageUpload,
} from "../../../controllers/slider/slider-controller.js";
import { upload } from "../../../helpers/cloudinary.js";

const router = express.Router();

// user side
router.get("/", getAllActiveSliders);

// admin side
router.post("/admin/upload-image", upload.single("image"), handleSliderImageUpload);
router.get("/admin", getAllSlidersForAdmin);
router.get("/admin/:id", getSingleSlider);
router.post("/admin", createSlider);
router.put("/admin/:id", updateSlider);
router.delete("/admin/:id", deleteSlider);

export default router;
