import Product from "../models/Product.js";

export const categorySlugMap = {
  laptops: "Laptop", monitors: "Lcd", printers: "Printer", ink: "Ink",
  "solid-state-drives": "SSD", networking: "Network",
  "all-in-one-computers": "All In One", toners: "Towner", accessories: "accessories",
};

export const slugify = (value = "") => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const categoryToSlug = (category = "") => Object.entries(categorySlugMap).find(([, value]) => value.toLowerCase() === category.toLowerCase())?.[0] || slugify(category);
export const productPath = (product) => `/${categoryToSlug(product.category)}/${product._id}/${slugify(product.title)}`;

const baseState = {
  auth: { isAuthenticated: false, isLoading: false, user: null },
  shopProducts: { productList: [], productDetails: null, isLoading: false },
};

export async function getSsrData(url) {
  const pathname = url.pathname;
  const productMatch = pathname.match(/^\/([^/]+)\/([a-f\d]{24})\/([^/]+)\/?$/i);
  let product = null;
  let products = [];

  if (productMatch && categorySlugMap[productMatch[1]]) {
    product = await Product.findById(productMatch[2]).lean();
  } else if (categorySlugMap[pathname.slice(1)]) {
    products = await Product.find({ category: categorySlugMap[pathname.slice(1)] }).sort({ price: 1 }).lean();
  } else if (["/", "/shop", "/shop/home", "/shop/listing"].includes(pathname)) {
    const filter = { category: { $ne: "HDD" } };
    const category = url.searchParams.get("category");
    if (category) filter.category = category;
    products = await Product.find(filter).sort({ price: 1 }).lean();
  }

  return {
    product,
    state: {
      ...baseState,
      shopProducts: { productList: products, productDetails: product, isLoading: false },
    },
  };
}

export function structuredData({ origin, pathname, product }) {
  const organization = {
    "@context": "https://schema.org", "@type": "ComputerStore", name: "Alam Computer",
    alternateName: "Intidhar Alam Computer", url: origin, image: `${origin}/logo1.webp`,
    telephone: process.env.STORE_PHONE || "+971557112599", priceRange: "$$",
    address: { "@type": "PostalAddress", streetAddress: "Industrial Area 3", addressLocality: "Sharjah", addressCountry: "AE" },
    geo: { "@type": "GeoCoordinates", latitude: 25.316147, longitude: 55.415842 },
  };
  const blocks = [organization];
  const categorySlug = pathname.split("/").filter(Boolean)[0];

  if (categorySlugMap[categorySlug]) {
    const items = [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: categorySlugMap[categorySlug], item: `${origin}/${categorySlug}` },
    ];
    if (product) items.push({ "@type": "ListItem", position: 3, name: product.title, item: `${origin}${productPath(product)}` });
    blocks.push({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items });
  }

  if (product) {
    const images = (product.images?.length ? product.images : [product.image]).filter(Boolean);
    const price = Number(product.salePrice) > 0 ? product.salePrice : product.price;
    blocks.push({
      "@context": "https://schema.org", "@type": "Product", name: product.title, image: images,
      description: product.description, sku: String(product._id), brand: { "@type": "Brand", name: product.brand || "Alam Computer" },
      offers: { "@type": "Offer", url: `${origin}${productPath(product)}`, priceCurrency: "AED", price,
        availability: product.totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
    });
  }
  return blocks;
}

let sitemapCache = { xml: "", expires: 0 };
export async function getSitemap(origin) {
  if (sitemapCache.expires > Date.now()) return sitemapCache.xml;
  const products = await Product.find({ category: { $ne: "HDD" } }, "title category updatedAt").lean();
  const urls = [
    { loc: origin, lastmod: new Date() },
    ...Object.keys(categorySlugMap).map((slug) => ({ loc: `${origin}/${slug}`, lastmod: new Date() })),
    ...products.map((product) => ({ loc: `${origin}${productPath(product)}`, lastmod: product.updatedAt })),
  ];
  const escape = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  sitemapCache.xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(({ loc, lastmod }) => `\n  <url><loc>${escape(loc)}</loc><lastmod>${new Date(lastmod).toISOString()}</lastmod></url>`).join("")}\n</urlset>`;
  sitemapCache.expires = Date.now() + 60 * 60 * 1000;
  return sitemapCache.xml;
}
