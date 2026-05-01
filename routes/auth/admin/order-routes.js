import express from 'express';
import {
  getAllOrders,
  updateOrderStatus,
} from '../../../controllers/admin/order-controller.js';

const router = express.Router();

// Get all orders
router.get('/get', getAllOrders);
router.put('/status/:id', updateOrderStatus);

export default router;
