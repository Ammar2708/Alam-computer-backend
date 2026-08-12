import mongoose from "mongoose";

let connectionPromise = null;

/**
 * Reuse one MongoDB connection per running server instance. This is important
 * on serverless hosts, where a request can arrive before the initial database
 * connection has completed.
 */
export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_DB) {
    throw new Error("MONGO_DB is not configured");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_DB, {
        serverSelectionTimeoutMS: 10000,
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
  return mongoose.connection;
};
