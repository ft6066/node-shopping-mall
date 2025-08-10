const mongoose = require("mongoose");
import User from "./User";
import Product from "./Product";
const Schema = mongoose.Schema;
const OrderSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, ref: User },
    shipTo: { type: String, required: true }, //주소
    contact: { type: Object, required: true, default: 0 },
    totalPrice: { type: Number },
    status: { type: String },
    items: [
      {
        productId: { type: mongoose.ObjectId, ref: Product, required: true },
        qty: { type: Number, default: 1, required: true },
        size: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

OrderSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updateAt;
  delete obj.createAt;

  return obj;
};

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
