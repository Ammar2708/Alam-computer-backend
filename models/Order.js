import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            default: '',
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        customerName: {
            type: String,
            required: true,
            trim: true,

        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        postalCode: {
            type: String,
            required: true,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
        paymentMethod: {
            type: String,
            enum: ["cash_on_delivery"],
            default: "cash_on_delivery",
        },
        paymentStatus: {
            type: String,
            enum: ["pending"],
            default: "pending",
        },
        orderStatus: {
            type: String,
            enum: ["placed", "processing", "delivered", "cancelled"],
            default: "processing",
        },
        items: {
            type: [orderItemSchema],
            default: [],
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,    
        },
    },
    { timestamps: true },
);

const Order = mongoose.model('Order', OrderSchema);
export default Order;
