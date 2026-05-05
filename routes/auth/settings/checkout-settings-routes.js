import express from 'express';
import {
  getCheckoutSettings,
  updateCheckoutSettings,
} from '../../../controllers/settings/checkout-settings-controller.js';

const router = express.Router();

router.get('/settings/checkout', getCheckoutSettings);
router.get('/admin/settings/checkout', getCheckoutSettings);
router.put('/admin/settings/checkout', updateCheckoutSettings);

export default router;
