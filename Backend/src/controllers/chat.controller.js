import ChatModel from "../models/Chat.models.js";
import MessageModel from "../models/Message.models.js";
import { generateChatTitle, generateResponse } from "../services/ai.service.js";


export async function sendMessage(req,res){
  const { message, chat: bodyChat, chatId: bodyChatId } = req.body
  const chatId = bodyChat || bodyChatId

  let title = null, chat = null;
  if(!chatId){
    title = await generateChatTitle(message)
    chat = await ChatModel.create({
      user: req.user.id,
      title
    })
  }

  const userMessage = await MessageModel.create({
    chat : chatId || chat._id,
    context : message,
    role : "user"
  })

  const messages = await MessageModel.find({ chat: chatId || chat._id })

  const result = await generateResponse(messages);

  const aiMessage = await MessageModel.create({
    chat : chatId || chat._id,
    context : result,
    role : "ai"
  })

  res.status(201).json({
    title,
    chat,
    aiMessage
  })
}

export async function getChats(req,res){
  const user = req.user
  
  const chats = await ChatModel.find({ user:user.id })

  res.status(200).json({
    message : "Chats retrieved successfully",
    chats
  })
}

export async function getMessage(req,res){
  const { chatId } = req.params

  const chat = await ChatModel.findOne({
    _id:chatId,
    user:req.user.id
  })
  if(!chat){
    return res.status(404).json({
      message : "Chat not found"
    })
  }

  const messages = await MessageModel.find({
    chat:chatId
  })

  res.status(200).json({
    message : "Messages retrieved successfully",
    messages  
  })
}

export async function deleteChat(req,res){
  const { chatId } = req.params

  const chat = await ChatModel.findByIdAndDelete({
    _id:chatId,
    user:req.user._id
  })
  if(!chat){
    return res.status(404).json({
      message : "Chat not found"
    })
  }

  await MessageModel.deleteMany({
    chat:chatId
  })

  res.status(200).json({
    message : "Chat deleted successfully"
  })
}