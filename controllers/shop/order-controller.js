import Cart from '../../models/Cart.js';
import Order from '../../models/Order.js';
import { getOrCreateCheckoutSettings } from '../settings/checkout-settings-controller.js';

const normalizeCartItems = (items = []) =>
    items
        .filter((item) => item?.productId)
        .map((item) => {
            const product = item.productId;
            const price = product.salePrice > 0 ? product.salePrice : product.price;

            return {
                productId: product._id || product,
                title: item.popupTitle || product.title,
                image: item.popupImage || product.image,
                price,
                quantity: item.quantity,
            };
        });

const createOrder = async (req, res) => {
    try {
        const {
            userId,
            customerName,
            email,
            phone,
            address,
            city,
            postalCode,
            notes = '',
            paymentMethod = 'cash_on_delivery',
        } = req.body;

        if (
            !userId ||
            !customerName ||
            !email ||
            !phone ||
            !address ||
            !city ||
            !postalCode
        ) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
        }

        if (paymentMethod !== 'cash_on_delivery') {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method',
            });
        }

        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'image title description price salePrice',
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty',
            });
        }

        const orderItems = normalizeCartItems(cart.items);
        if (orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid items in cart',
            });
        }

        const subtotalAmount = orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        const checkoutSettings = await getOrCreateCheckoutSettings();
        const deliveryCharge = Math.max(0, Number(checkoutSettings?.deliveryCharge) || 0);
        const totalAmount = subtotalAmount + deliveryCharge;

        const order = await Order.create({
            userId,
            customerName,
            email,
            phone,
            address,
            city,
            postalCode,
            notes,
            paymentMethod,
            orderStatus: 'processing',
            items: orderItems,
            subtotalAmount,
            deliveryCharge,
            totalAmount,
        });

        cart.items = [];
        await cart.save();

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

export { createOrder };
