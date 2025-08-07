const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

//로그인한 유저만 카트에 아이템을 추가할 수 있도록 토큰이 있는 지 확인
router.post("/cart", authController.authenticate, cartController.addItemToCart);

module.exports = router;
