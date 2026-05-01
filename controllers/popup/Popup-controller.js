// controllers/popupController.js
import PopupDeal from "../../models/Popup.js";
import { imageUploadUtil } from "../../helpers/cloudinary.js";

export const handlePopupImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Popup image upload failed", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Popup image upload failed",
    });
  }
};

export const getLatestPopup = async (req, res) => {
  try {
    const now = new Date();

    const popup = await PopupDeal.findOne({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate({
        path: "productId",
        select: "title image price salePrice totalStock",
      })
      .sort({ updatedAt: -1 });

    if (!popup) {
      return res.status(200).json(null);
    }

    return res.status(200).json(popup);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch latest popup",
      error: error.message,
    });
  }
};

export const createPopup = async (req, res) => {
  try {
    const popup = await PopupDeal.create(req.body);

    return res.status(201).json({
      message: "Popup created successfully",
      popup,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create popup",
      error: error.message,
    });
  }
};

export const getAllPopups = async (req, res) => {
  try {
    const popups = await PopupDeal.find().sort({ createdAt: -1 });

    return res.status(200).json(popups);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch popups",
      error: error.message,
    });
  }
};

export const updatePopup = async (req, res) => {
  try {
    const { id } = req.params;

    const popup = await PopupDeal.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!popup) {
      return res.status(404).json({
        message: "Popup not found",
      });
    }

    return res.status(200).json({
      message: "Popup updated successfully",
      popup,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update popup",
      error: error.message,
    });
  }
};

export const deletePopup = async (req, res) => {
  try {
    const { id } = req.params;

    const popup = await PopupDeal.findByIdAndDelete(id);

    if (!popup) {
      return res.status(404).json({
        message: "Popup not found",
      });
    }

    return res.status(200).json({
      message: "Popup deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete popup",
      error: error.message,
    });
  }
};
