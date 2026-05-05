import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRouter from "./routes/auth/auth-routes.js";
import adminProductRouter from "./routes/auth/admin/product-routes.js";
import shopProductRouter from "./routes/auth/shop/product-routes.js";
import shopCartRouter from "./routes/auth/shop/cart-routes.js";
import contactRoutes from "./routes/auth/contact/contact-routes.js";
import popupRoutes from "./routes/auth/popup/popup-routes.js";
import sliderRoutes from "./routes/auth/slider/slider-routes.js";
import adminOrderRouter from "./routes/auth/admin/order-routes.js";
import shopOrderRouter from "./routes/auth/shop/order-routes.js"; 
import checkoutSettingsRouter from "./routes/auth/settings/checkout-settings-routes.js";


dotenv.config();

// DB connection
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// App
const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "cache-control",
      "expires",
      "pragma",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductRouter);
app.use("/api/shop/products", shopProductRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api", contactRoutes);
app.use("/api", popupRoutes);
app.use("/api/slider", sliderRoutes);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/shop/orders", shopOrderRouter);
app.use("/api", checkoutSettingsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
