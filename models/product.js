const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  categories: {
    type: String, // Modificat din Object în String
    required: [true, "categories is required"],
  },
  weight: {
    type: Number,
    required: [true, "weight is required"],
  },
  title: {
    type: String, // Modificat din Object în String
    required: [true, "title is required"],
  },
  calories: {
    type: Number,
    required: [true, "calories is required"],
  },
  groupBloodNotAllowed: {
    type: Array,
    required: [true, "groupBloodNotAllowed is required"],
  },
}, { versionKey: false });

const Product = model("product", productSchema);

module.exports = Product;
