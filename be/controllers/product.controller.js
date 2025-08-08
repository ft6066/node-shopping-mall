const Product = require("../models/Product");

const PAGE_SIZE = 1;
const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;

    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res
        .status(400)
        .json({ status: "fail", error: "이미 존재하는 sku입니다." });
    }

    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });
    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const { page, name } = req.query;
    const cond = name
      ? { name: { $regex: name, $options: "i" }, isDelete: false }
      : { isDelete: false };
    let query = Product.find(cond);
    let response = { status: "success" };
    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      // 최종 몇개 페이지
      // 데이터가 총 몇개 있는 지
      const totalItemNum = await Product.countDocuments(cond);
      // 데이터 총 개수 / PAGE_SIZE
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const productList = await query.exec();
    response.data = productList;

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    //어떤 데이터를 수정할 지 모르기 때문에 전체를 가져온다.
    const {
      sku,
      name,
      size,
      image,
      price,
      description,
      category,
      stock,
      status,
    } = req.body;

    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res
        .status(400)
        .json({ status: "fail", error: "이미 존재하는 sku입니다." });
    }

    // 유효성 검사: 재고는 0 이상이어야 함
    for (const key in stock) {
      if (stock[key] < 0) {
        return res.status(400).json({
          status: "fail",
          error: `옵션 "${key.toUpperCase()}"의 재고는 0 이상이어야 합니다.`,
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, size, image, price, description, category, stock, status },
      { new: true } // 업데이트한 후 새로운 값을 반환받을 수 있다.
    );
    if (!product) throw new Error("item doesn't exist");
    res.status(200).json({ status: "success", data: product }); // 수정한 데이터 product를 데이터로 보내준다.
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.deletedProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDelete: true }
    );
    if (!product) throw new Error("no item");
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId, isDelete: false });
    if (!product) throw new Error("상품을 찾을 수 없습니다.");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = productController;
