import "dotenv/config"

import app from "./src/app.js";
import connectDB from "./src/configration/database.js";
import http from "http"
import { initialSocket } from "./src/sockects/service.socket.js";

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app)

initialSocket(httpServer)

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("Database connected successfully");

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Handle server errors
    httpServer.on("error", (error) => {
      console.error("Server error:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start the server
startServer();