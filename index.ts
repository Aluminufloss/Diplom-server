import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import express, { Application } from "express";

import router from "./router/index";

import errorMiddleware from "./middleware/error-middleware";

import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app: Application = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/", router);

// @ts-ignore
app.use(errorMiddleware);

const start = async () => {
  try {
    if (!process.env.CONNECT_STRING) {
      throw new Error(
        "CONNECT_STRING is not defined in the environment variables."
      );
    }

    await mongoose.connect(process.env.CONNECT_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start the server or connect to the database", err);
  }
};

start();
