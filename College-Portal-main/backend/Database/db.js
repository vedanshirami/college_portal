require("dotenv").config();
const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

const connectToMongo = () => {
  if (!mongoURI) {
    throw new Error("Missing MONGODB_URI (or MONGO_URI) environment variable");
  }

  return mongoose
    .connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    })
    .then(() => {
      console.log("Connected to MongoDB Successfully");
      return mongoose.connection;
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB", error);
      throw error;
    });
};

module.exports = connectToMongo;
