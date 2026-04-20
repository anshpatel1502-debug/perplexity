import { Router } from "express";
import { authUser } from "../middlewares/auth.middlewares.js";
import { sendMessage,getChats,getMessage,deleteChat  } from "../controllers/chat.controller.js";

const chatRouter = Router();

chatRouter.post("/message",authUser,sendMessage)

chatRouter.get("/",authUser,getChats)

chatRouter.get("/:chatId/messages",authUser,getMessage)

chatRouter.delete("/delete/:chatId",authUser,deleteChat)

export default chatRouter;