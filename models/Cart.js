import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                    },
                    quantity: {
                        type: Number,
                        required: true,
                        min: 1,
                        },
                    popupTitle: {
                        type: String,
                        default: "",
                        trim: true,
                    },
                    popupDescription: {
                        type: String,
                        default: "",
                        trim: true,
                    },
                    popupImage: {
                        type: String,
                        default: "",
                    },
                        },
                        ],
                        },
                        {
                            timestamps: true,
                            }
                            );

 const Cart = mongoose.model("Cart", CartSchema);
export default Cart
                            
