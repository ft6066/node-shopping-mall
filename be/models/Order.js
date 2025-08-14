const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Schema = mongoose.Schema;
const OrderSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, ref: User },
    shipTo: { type: Object, required: true }, //주소
    contact: { type: Object, required: true, default: 0 },
    totalPrice: { type: Number },
    status: {
      type: String,
      enum: ["preparing", "shipping", "refund", "delivered"],
      default: "preparing",
    },
    orderNum: { type: String },
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

OrderSchema.post("save", async function () {
  // 카트를 비워주자
  const cart = await Cart.findOne({ userId: this.userId });
  cart.items = [];
  await cart.save();
});

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
