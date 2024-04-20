require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const router = require("./router/index");
const errorMiddleware = require("./middleware/error-middleware");

const PORT = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/", router);
app.use(errorMiddleware);

const start = async () => {
  await mongoose.connect(process.env.CONNECT_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  app.listen(PORT, (err) => {
    if (err) {
      console.log("Something wrong with connection to database", err);
      return;
    }
    console.log(`server started on port ${PORT}`);
  });
};

start();
