import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import compression from "compression";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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
import assistantRouter from "./routes/auth/assistant/assistant-routes.js";
import { categorySlugMap, getSitemap, getSsrData, structuredData } from "./services/seo.js";


dotenv.config();

// DB connection
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// App
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(serverDir, "../client/dist");
const ssrEntry = path.resolve(serverDir, "../client/dist/server/entry-server.js");
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
app.use(compression());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is live",
  });
});

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
app.use("/api", assistantRouter);

const legacyCategoryRedirects = {
  "/Laptop": "/laptops", "/Monitor": "/monitors", "/Printer": "/printers",
  "/Ink": "/ink", "/SSD": "/solid-state-drives", "/Network": "/networking",
  "/All": "/all-in-one-computers", "/Towner": "/toners",
};

app.use((req, res, next) => {
  if (legacyCategoryRedirects[req.path]) return res.redirect(301, legacyCategoryRedirects[req.path]);
  if (req.path === "/shop/home" || req.path === "/shop") return res.redirect(301, "/");
  if (req.path === "/shop/listing" && req.query.category) {
    const slug = Object.entries(categorySlugMap).find(([, category]) => category === req.query.category)?.[0];
    if (slug && !req.query.search && Object.keys(req.query).length === 1) return res.redirect(301, `/${slug}`);
  }
  next();
});

app.get("/robots.txt", (req, res) => {
  const origin = (process.env.SITE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
  res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /checkout\nDisallow: /account\nDisallow: /admin\nDisallow: /shop/checkout\nDisallow: /shop/account\nSitemap: ${origin}/sitemap.xml\n`);
});

app.get("/sitemap.xml", async (req, res, next) => {
  try {
    const origin = (process.env.SITE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
    res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.type("application/xml").send(await getSitemap(origin));
  } catch (error) { next(error); }
});

app.use("/assets", express.static(path.join(clientDist, "assets"), {
  immutable: true, maxAge: "1y",
}));
app.use(express.static(clientDist, { maxAge: "1d", index: false }));

const serialize = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

app.use(async (req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
  try {
    const [template, ssrModule] = await Promise.all([
      fs.readFile(path.join(clientDist, "index.html"), "utf8"),
      import(`${pathToFileURL(ssrEntry).href}?v=${process.env.NODE_ENV === "development" ? Date.now() : "prod"}`),
    ]);
    const origin = (process.env.SITE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
    const url = new URL(req.originalUrl, origin);
    const { product, state } = await getSsrData(url);
    const rendered = ssrModule.render(req.originalUrl, state);
    const helmet = rendered.helmet;
    const helmetMarkup = (rendered.head || [helmet?.title, helmet?.meta, helmet?.link].filter(Boolean).map((tag) => tag.toString()).join("\n")).replaceAll("http://localhost:3000", origin);
    const jsonLd = structuredData({ origin, pathname: url.pathname, product })
      .map((data) => `<script type="application/ld+json">${serialize(data)}</script>`).join("\n");
    const stateScript = `<script>window.__PRELOADED_STATE__=${serialize(rendered.state)}</script>`;
    const routeTemplate = template
      .replace(/<title>Alam Computer – Computer Sales, Repair &amp; Spare Parts in Sharjah, UAE<\/title>/, "")
      .replace(/<meta name="description" content="Alam Computer in Sharjah offers computer &amp; printer sales, repair, and spare parts\. Trusted locally for 15\+ years\. Visit us in Industrial Area 3, Sharjah, or call \+971-5-57112599\."\s*\/>/, "");
    const html = routeTemplate
      .replace("<!--app-head-->", `${helmetMarkup}\n${jsonLd}`)
      .replace("<!--app-html-->", rendered.html)
      .replace("<!--app-state-->", stateScript);
    res.status(product === null && /^\/[^/]+\/[a-f\d]{24}\//i.test(url.pathname) ? 404 : 200).type("html").send(html);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(503).send("Storefront build not found. Run `npm run build:ssr` in the client directory.");
    }
    next(error);
  }
});

// Start server
if (!process.env.VERCEL) {
  app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
}

export default app;
