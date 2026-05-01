import express from "express";
const router = express.Router();
import {
    addToCart,
    fetchCartItems,
    updateCartItemQty,
    deleteCartItem,
    
} from "../../../controllers/shop/cartController.js";


router.post("/add", addToCart);
router.get("/get/:userId", fetchCartItems);
router.put("/update", updateCartItemQty);
router.delete("/delete", deleteCartItem);

export default router