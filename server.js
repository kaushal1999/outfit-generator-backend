import express, { json } from "express";
import morgan from "morgan";
import cors from "cors";
import  urlencoded  from "body-parser";
import { config } from "dotenv";
import  connectDB  from "./config/db.js";
import errorHandler from "./middelwares/errorMiddleware.js";

//routes path
import authRoutes from "./routes/authRoutes.js";
import prefRoutes from "./routes/prefRoute.js";
import openaiRoutes from "./routes/openaiRoutes.js";


//dotenv
config();

//mongo connection

//rest object
const app = express();

//middlewares
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

//API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/preferences", prefRoutes);
app.use("/api/v1/openai", openaiRoutes); 

//listen server
app.listen(PORT, async () => {
  try {
   await connectDB();
   console.log(
    `Server Running in ${process.env.DEV_MODE} mode on port no ${PORT}`
  );
  } catch (error) {
    console.log(error);
  }
});
