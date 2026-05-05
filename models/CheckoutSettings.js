import mongoose from 'mongoose';

const CheckoutSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'checkout',
      unique: true,
      index: true,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const CheckoutSettings = mongoose.model('CheckoutSettings', CheckoutSettingsSchema);

export default CheckoutSettings;
