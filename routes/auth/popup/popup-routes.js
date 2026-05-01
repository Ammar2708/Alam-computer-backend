// routes/popupRoutes.js
import express from "express";
import {
  handlePopupImageUpload,
  getLatestPopup,
  createPopup,
  getAllPopups,
  updatePopup,
  deletePopup,
} from "../../../controllers/popup/Popup-controller.js";
import { upload } from "../../../helpers/cloudinary.js";

const router = express.Router();

router.post("/admin/popup/upload-image", upload.single("image"), handlePopupImageUpload);
router.get("/latest-popup", getLatestPopup);
router.get("/admin/popup", getAllPopups);
router.post("/admin/popup", createPopup);
router.put("/admin/popup/:id", updatePopup);
router.delete("/admin/popup/:id", deletePopup);

export default router;
