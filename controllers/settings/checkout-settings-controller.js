import CheckoutSettings from '../../models/CheckoutSettings.js';

const CHECKOUT_SETTINGS_KEY = 'checkout';

const normalizeDeliveryCharge = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100) / 100;
};

const getOrCreateCheckoutSettings = async () => {
  const settings = await CheckoutSettings.findOneAndUpdate(
    { key: CHECKOUT_SETTINGS_KEY },
    { $setOnInsert: { key: CHECKOUT_SETTINGS_KEY, deliveryCharge: 0 } },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return settings;
};

const getCheckoutSettings = async (req, res) => {
  try {
    const settings = await getOrCreateCheckoutSettings();

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch checkout settings',
      error: error.message,
    });
  }
};

const updateCheckoutSettings = async (req, res) => {
  try {
    const deliveryCharge = normalizeDeliveryCharge(req.body?.deliveryCharge);

    if (deliveryCharge === null) {
      return res.status(400).json({
        success: false,
        message: 'Delivery charge must be a positive number or zero',
      });
    }

    const settings = await CheckoutSettings.findOneAndUpdate(
      { key: CHECKOUT_SETTINGS_KEY },
      {
        $set: {
          key: CHECKOUT_SETTINGS_KEY,
          deliveryCharge,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Checkout settings updated successfully',
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update checkout settings',
      error: error.message,
    });
  }
};

export {
  getCheckoutSettings,
  getOrCreateCheckoutSettings,
  updateCheckoutSettings,
};
