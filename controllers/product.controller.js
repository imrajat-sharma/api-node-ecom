const fs = require("fs").promises;
const path = require("path");
const AppError = require("../utils/appError");

const dbPath = path.join(__dirname, "../db/db.json");

// helper functions
const readDB = async () => {
  const data = await fs.readFile(dbPath, "utf-8");
  return JSON.parse(data);
};

const writeDB = async (data) => {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
};

// GET /api/products
// supports: ?category=Electronics&featured=true&page=1&limit=5
const getAllProducts = async (req, res, next) => {
  try {
    const { category, featured, page = 1, limit = 10 } = req.query;

    // Validate pagination params
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));

    const db = await readDB();

    let products = db.products;

    // filtering
    if (category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (featured !== undefined) {
      products = products.filter((p) => p.featured === (featured === "true"));
    }

    // pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      total: products.length,
      page: pageNum,
      limit: limitNum,
      products: paginatedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return next(new AppError("Invalid product ID", 400));
    }

    const db = await readDB();

    const product = db.products.find((p) => p.id === productId);

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image, stock, featured, rating = null } = req.body;

    // Input validation
    if (!name || !price || !category || !description || !image) {
      return next(new AppError("name, description, price, image, and category are required", 400));
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return next(new AppError("price must be a valid positive number", 400));
    }

    // Validate name length
    if (
      typeof name !== "string" ||
      name.trim().length === 0 ||
      name.length > 255
    ) {
      return next(
        new AppError("name must be a non-empty string (max 255 chars)", 400)
      );
    }

    const db = await readDB();
    const nextId =
      db.products.length > 0 ? db.products[db.products.length - 1].id + 1 : 1;

    const productToAdd = {
      id: nextId,
      name: name.trim(),
      description: description.trim(),
      image: image.trim(),
      price: priceNum,
      category: category.trim(),
      rating: 0 || rating,
      stock: Math.max(0, parseInt(stock) || 0),
      featured: featured === true || featured === "true",
    };

    db.products.push(productToAdd);
    await writeDB(db);

    res.status(201).json({
      success: true,
      product: productToAdd,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
};
