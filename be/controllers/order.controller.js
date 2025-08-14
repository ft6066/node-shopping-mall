const Order = require("../models/Order");
const productController = require("./product.controller");
const orderController = {};
const randomStringGenerator = require("../utils/randomStringGenerator");
const { populate } = require("dotenv");

const PAGE_SIZE = 2;

orderController.createOrder = async (req, res) => {
  try {
    // 프론트엔드에서 보낸 데이터를 받아온다. userId, totalPrice, shipTo, contact, orderList
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;

    // 재고 확인 (재고만 확인, 아직 차감하지 않음)
    const insufficientStockItems = await productController.checkItemStockOnly(
      orderList
    );

    // 재고가 충분하지 않은 아이템이 있었다 => 에러 발생
    if (insufficientStockItems.length > 0) {
      const itemMessages = insufficientStockItems
        .map((item) => item.message)
        .join(", ");
      const errorMessage = `다음 상품의 재고가 부족하여 결제에 실패했습니다: ${itemMessages}`;
      throw new Error(errorMessage);
    }
    // 재고 차감
    await productController.reduceStock(orderList);

    // order를 만들자
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
      status: "preparing",
    });

    await newOrder.save();
    // save후에 카트를 비워주기
    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;
    const orderList = await Order.find({ userId }).populate({
      path: "items.productId",
      model: "Product",
      select: "image name",
    });
    const totalItemNum = await Order.find({ userId }).countDocuments();

    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
    res.status(200).json({ status: "success", data: orderList, totalPageNum });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    const { page, ordernum, limit } = req.query;
    const pageNum = parseInt(page) || 1; // 기본값 1
    const limitNum = parseInt(limit) || PAGE_SIZE; // 기본값 PAGE_SIZE

    let cond = {};
    if (ordernum) {
      cond.orderNum = { $regex: ordernum, $options: "i" };
    }

    const orderList = await Order.find(cond)
      .populate({ path: "userId", select: "name email" })
      .populate({
        path: "items.productId",
        model: "Product",
        select: "image name",
      })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalItemNum = await Order.find(cond).countDocuments();
    const totalPageNum = Math.ceil(totalItemNum / limitNum);

    res.status(200).json({ status: "success", data: orderList, totalPageNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) throw new Error("주문내역이 없습니다.");
    res.status(200).json({ status: "success", data: order });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = orderController;
