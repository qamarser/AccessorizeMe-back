import { Product, Category } from "../config/db.js";

export const generateSitemap = async (req, res) => {
  try {
    const baseUrl = "https://accessorize-me-front.vercel.app/" || "http://localhost:5000";

    // Fetch all products and categories
    const products = await Product.findAll({
      attributes: ["id", "name"],
    });
    const categories = await Category.findAll({
      attributes: ["id", "name"],
    });

    // Generate URLs for products and categories
    const productUrls = products.map(
      (product) => `${baseUrl}/products/${product.id}`
    );
    const categoryUrls = categories.map(
      (category) => `${baseUrl}/categories/${category.id}`
    );

    // Build sitemap XML
    const urls = [...productUrls, ...categoryUrls];
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
  <url>
    <loc>${url}</loc>
  </url>`
    )
    .join("")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemapXml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
};
