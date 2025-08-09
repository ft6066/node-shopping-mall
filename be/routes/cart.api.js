const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

//로그인한 유저만 카트에 아이템을 추가할 수 있도록 토큰이 있는 지 확인
router.post("/", authController.authenticate, cartController.addItemToCart);
router.get("/", authController.authenticate, cartController.getCart);
router.delete(
  "/:id",
  authController.authenticate,
  cartController.deleteCartItem
);
router.put("/:id", authController.authenticate, cartController.updateCartItem);

router.get("/qty", authController.authenticate, cartController.getCartQty);
module.exports = router;
