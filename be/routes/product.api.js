const express = require("express");
const authController = require("../controllers/auth.controller");
const productController = require("../controllers/product.controller");
const router = express.Router();

router.post(
  "/",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.createProduct
);

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductDetail);

router.put(
  "/:id", // 특정 상품을 업데이트하기 위해 id를 가져온다
  authController.authenticate,
  authController.checkAdminPermission, // 어드민만 업데이트 할 수 있도록 체크
  productController.updateProduct
);

router.delete(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.deletedProduct
);

module.exports = router;
