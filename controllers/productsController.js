const moment = require("moment");
const EatenProduct = require("../models/eatenProduct");
const Product = require("../models/product");
const User = require("../models/user");
const { RequestError, calcDailyCalorieNorm } = require("../helpers");
const { eatenProductSchema } = require("../schemas/products");
const { userDataSchema } = require("../schemas/users");

// Funcție pentru escaparea regex-ului
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Căutare în baza de date
const getProductFromDB = async (req, res, next) => {
  try {
    const { title } = req.query;
    if (!title) {
      throw RequestError(400, "Query parameter 'title' is required");
    }

    const regexTitle = escapeRegex(title.trim());

    const result = await Product.find({
      title: { $regex: `^${regexTitle}$`, $options: "i" },
    }).select("-__v");

    if (!result || result.length === 0) {
      throw RequestError(404, "Product not found");
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getProductFromDB:", error.message);
    next(error);
  }
};

// Calcul public al caloriilor
const getDailyCalPublic = async (req, res, next) => {
  try {
    const { error } = userDataSchema.validate(req.body);
    if (error) {
      throw RequestError(400, error.message);
    }
    const userInfo = req.body;
    const dailyCalorieNorm = calcDailyCalorieNorm(userInfo);
    const products = await Product.find({
      [`groupBloodNotAllowed.${userInfo.bloodType}`]: true,
    });

    const prohibitedProducts = products.map(({ title }) => ({ title }));

    res.json({ dailyRate: dailyCalorieNorm, notRecFood: prohibitedProducts });
  } catch (error) {
    next(error);
  }
};

// Calcul privat al caloriilor
const getDailyCalPrivate = async (req, res, next) => {
  try {
    const { error } = userDataSchema.validate(req.body);
    if (error) {
      throw RequestError(400, error.message);
    }

    const userInfo = req.body;
    const dailyCalorieNorm = calcDailyCalorieNorm(userInfo);

    const products = await Product.find({
      [`groupBloodNotAllowed.${userInfo.bloodType}`]: true,
    });

    const prohibitedProducts = products.map(({ title }) => ({ title }));

    const { id: owner } = req.user;

    const updatedUser = await User.findByIdAndUpdate(
      owner,
      {
        ...userInfo,
        dailyRate: dailyCalorieNorm,
        notRecFood: prohibitedProducts,
      },
      { new: true }
    ).select("-name -email -password -createdAt -updatedAt -token");

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// Adaugare produs
const addProduct = async (req, res, next) => {
  try {
    const { error } = eatenProductSchema.validate(req.body);
    if (error) {
      throw RequestError(400, error.message);
    }

    let { title, weight } = req.body;
    title = title.trim();

    const product = await Product.findOne({
      title: { $regex: `^${escapeRegex(title)}$`, $options: "i" },
    });

    if (!product) {
      throw RequestError(404, "There is no such product in the database");
    }

    const countedCalories = Math.round((product.calories / 100) * weight);
    const { id: owner } = req.user;

    const result = await EatenProduct.create({
      ...req.body,
      calories: countedCalories,
      owner,
      date: new Date(),
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Obținere produse
const getProducts = async (req, res, next) => {
  try {
    const { date } = req.params;
    if (!date) {
      throw RequestError(400, "Invalid query data");
    }

    const { id: owner } = req.user;
    const products = await EatenProduct.find({ owner });

    if (products.length === 0) {
      throw RequestError(404, "No products found");
    }

    const result = products
      .filter((prod) => moment(prod.date).format("DD.MM.YYYY") === date)
      .sort((a, b) => b.date - a.date);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Ștergere produs
const removeProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      throw RequestError(400, "Invalid query data");
    }

    const { id: owner } = req.user;
    const result = await EatenProduct.findOneAndRemove({
      _id: productId,
      owner,
    });

    if (!result) {
      throw RequestError(404, "Product not found");
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Export funcții
module.exports = {
  getProductFromDB,
  getDailyCalPublic,
  getDailyCalPrivate,
  getProducts,
  addProduct,
  removeProduct,
};
