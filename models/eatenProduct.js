const { Schema, model } = require("mongoose");

const eatenProductSchema = new Schema(
  {
    title: { // Modificat productName în title
      type: String,
      required: [true, "Title is required"],
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
    },
    calories: {
      type: Number,
    },
    date: {
      type: Date,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false }
);

const EatenProduct = model("eatenProduct", eatenProductSchema);

module.exports = EatenProduct;
