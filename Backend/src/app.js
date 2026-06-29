import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
console.log(process.env.FRONTEND_URL);
app.use(cors({
  origin:process.env.FRONTEND_URL,
  // origin:"http://localhost:5173",
  credentials:true,
  methods:["GET","POST","PUT","DELETE"]
}))

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running", timestamp: new Date() });
});

app.use("/api/auth",authRouter);
app.use("/api/chats",chatRouter)

export default app;