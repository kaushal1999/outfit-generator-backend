import mongoose from "mongoose";

const client=mongoose.MongoC
const connectDB =  async () => {
  try {
    mongoose.connect(process.env.MONGO_URI)
    console.log(
      `Connected To Mongodb Database`
    )
  } catch (error) {
    console.log(`Mongodb Database Error ${error}`);
  }
};

export default connectDB;
