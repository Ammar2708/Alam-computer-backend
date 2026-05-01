import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    eyebrow: {
      type: String,
      default: "",
      trim: true,
    },
    accent: {
      type: String,
      default: "",
      trim: true,
    },
    statLabel: {
      type: String,
      default: "",
      trim: true,
    },
    statValue: {
      type: String,
      default: "",
      trim: true,
    },
    highlights: {
      type: [String],
      default: [],
    },
    buttonText: {
      type: String,
      default: "Shop Now",
      trim: true,
    },
    buttonLink: {
      type: String,
      default: "/shop/listing",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Slider = mongoose.model("Slider", sliderSchema);

export default Slider;