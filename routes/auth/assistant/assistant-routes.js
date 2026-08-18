import express from "express";
import Product from "../../../models/Product.js";

const router = express.Router();
const requestsByIp = new Map();

const STORE_DETAILS = `Alam Computer is a technology store in Industrial Area 3, Sharjah, UAE.
Phone: 0528036944. Email: alamcomputeruae@gmail.com.
The store sells laptops, monitors, printers, ink, network equipment, all-in-one computers, toners, storage, and accessories.`;

const PRODUCT_TYPE_RULES = [
  { category: "Laptop", terms: ["laptop", "laptops", "notebook", "notebooks"] },
  { category: "Printer", terms: ["printer", "printers", "laserjet"] },
  { category: "Lcd", terms: ["monitor", "monitors", "display", "displays", "lcd"] },
  { category: "Ink", terms: ["ink", "inks", "cartridge", "cartridges"] },
  { category: "Towner", terms: ["toner", "toners"] },
  { category: "SSD", terms: ["ssd", "storage", "hard drive", "hard drives"] },
  { category: "Network", terms: ["network", "networking", "router", "routers", "switch", "switches"] },
  { category: "All In One", terms: ["all in one", "all-in-one", "aio computer", "aio pc"] },
];

const getRequestedCategory = (text = "") => {
  const normalized = ` ${text.toLowerCase().replace(/[^a-z0-9-]+/g, " ")} `;
  return PRODUCT_TYPE_RULES.find(({ terms }) =>
    terms.some((term) => normalized.includes(` ${term} `))
  )?.category;
};

const getTextFromResponse = (response) =>
  response?.output
    ?.flatMap((item) => item?.content || [])
    .filter((item) => item?.type === "output_text")
    .map((item) => item.text)
    .join("\n")
    .trim();

const isRateLimited = (ip) => {
  const now = Date.now();
  const windowStart = now - 60_000;
  const recent = (requestsByIp.get(ip) || []).filter((time) => time > windowStart);
  recent.push(now);
  requestsByIp.set(ip, recent);
  return recent.length > 12;
};

router.post("/assistant/chat", async (req, res) => {
  try {
    if (isRateLimited(req.ip || "unknown")) {
      return res.status(429).json({ success: false, message: "Please wait a moment before sending another message." });
    }

    const incomingMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const messages = incomingMessages
      .slice(-10)
      .filter((message) => ["user", "assistant"].includes(message?.role) && typeof message?.text === "string")
      .map((message) => ({ role: message.role, content: message.text.slice(0, 1000) }));

    if (!messages.length || messages.at(-1)?.role !== "user") {
      return res.status(400).json({ success: false, message: "A customer message is required." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ success: false, message: "AI service is not configured." });
    }

    const products = await Product.find({})
      .select("title description category brand price salePrice totalStock")
      .sort({ updatedAt: -1 })
      .limit(80)
      .lean();

    const requestedCategory = getRequestedCategory(messages.at(-1).content);
    const relevantProducts = requestedCategory
      ? products.filter((product) => product.category?.trim().toLowerCase() === requestedCategory.toLowerCase())
      : products;

    const catalog = relevantProducts.map((product) => ({
      id: String(product._id),
      title: product.title,
      brand: product.brand,
      category: product.category,
      price: product.salePrice || product.price,
      inStock: Number(product.totalStock) > 0,
      description: product.description?.slice(0, 180),
    }));

    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL || "gpt-5.6-luna",
        reasoning: { effort: "low" },
        text: { verbosity: "low" },
        max_output_tokens: 350,
        instructions: `${STORE_DETAILS}

You are Alam Assistant, a professional customer shopping assistant. Answer naturally in the customer's language. Be concise, friendly, and practical. Use only the supplied catalog and store details for factual store claims. Never invent stock, prices, specifications, policies, discounts, delivery times, or warranties. A requested product type is a strict requirement: never recommend a different category merely because its description contains the requested word. When recommending products, mention at most three exact catalog titles and briefly explain why. If no supplied product matches the requested type, clearly say that no matching product is available and do not offer unrelated products. If information is unavailable, say so and direct the customer to call the store. Do not ask for passwords, card details, or other sensitive data.

Current catalog JSON:
${JSON.stringify(catalog)}`,
        input: messages,
      }),
    });

    const responseData = await openAIResponse.json();
    if (!openAIResponse.ok) {
      console.error("OpenAI assistant error:", responseData?.error?.message || openAIResponse.status);
      return res.status(502).json({ success: false, message: "The assistant is temporarily unavailable." });
    }

    const reply = getTextFromResponse(responseData);
    if (!reply) {
      return res.status(502).json({ success: false, message: "The assistant returned an empty response." });
    }

    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("Assistant route error:", error);
    return res.status(500).json({ success: false, message: "Unable to answer right now." });
  }
});

export default router;
