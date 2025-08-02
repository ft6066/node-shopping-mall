require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const indexRouter = require("./routes/index");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // req.body가 객체로 인식이 됩니다.
app.use("/api", indexRouter); // /api/user

const MONGODB_URI_PROD = process.env.LOCAL_DB_ADDRESS;

mongoose
  .connect(MONGODB_URI_PROD)
  .then(() => {
    console.log("몽구스 연결 성공");
  })
  .catch((err) => {
    console.log("몽구스 연결 실패", err);
  });

app.listen(process.env.PORT || 6500, () => {
  console.log(process.env.PORT, "서버 켜짐");
});
