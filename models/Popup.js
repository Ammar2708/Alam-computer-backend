// models/PopupDeal.js
import mongoose from "mongoose";

const popupDealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    buttonText: {
      type: String,
      default: "Shop Now",
    },

    buttonLink: {
      type: String,
      default: "/",
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          const startDate =
            typeof this.get === "function" ? this.get("startDate") : this.startDate;

          if (!startDate || !value) {
            return true;
          }

          return new Date(value).getTime() > new Date(startDate).getTime();
        },
        message: "End date must be after start date",
      },
    },
  },
  {
    timestamps: true,
  }
);

const PopupDeal = mongoose.model("PopupDeal", popupDealSchema);

export default PopupDeal;
