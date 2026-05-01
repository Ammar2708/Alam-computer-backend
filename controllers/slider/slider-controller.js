import Slider from "../../models/Slider.js";
import { imageUploadUtil } from "../../helpers/cloudinary.js";

export const handleSliderImageUpload = async (req, res) => {
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
    return res.status(500).json({
      success: false,
      message: "Slider image upload failed",
      error: error.message,
    });
  }
};

export const getAllActiveSliders = async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: sliders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sliders",
      error: error.message,
    });
  }
};

export const getAllSlidersForAdmin = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: sliders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin sliders",
      error: error.message,
    });
  }
};

export const createSlider = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      eyebrow,
      accent,
      statLabel,
      statValue,
      highlights,
      buttonText,
      buttonLink,
      order,
      isActive,
    } = req.body;

    const newSlider = new Slider({
      title,
      description,
      image,
      eyebrow,
      accent,
      statLabel,
      statValue,
      highlights,
      buttonText,
      buttonLink,
      order,
      isActive,
    });

    await newSlider.save();

    return res.status(201).json({
      success: true,
      message: "Slider created successfully",
      data: newSlider,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create slider",
      error: error.message,
    });
  }
};

export const updateSlider = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedSlider = await Slider.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedSlider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Slider updated successfully",
      data: updatedSlider,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update slider",
      error: error.message,
    });
  }
};

export const deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSlider = await Slider.findByIdAndDelete(id);

    if (!deletedSlider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Slider deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete slider",
      error: error.message,
    });
  }
};

export const getSingleSlider = async (req, res) => {
  try {
    const { id } = req.params;

    const slider = await Slider.findById(id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: slider,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch slider",
      error: error.message,
    });
  }
};
