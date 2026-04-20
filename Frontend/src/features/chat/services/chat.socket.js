import { io } from "socket.io-client"

let socket = null;

export const initializeSocketConnection = () => {
  if (socket) return socket;
  
  socket = io("http://localhost:3000",{
    withCredentials:true
  })

  socket.on("connect",() => {
    console.log("✓ Connected to Socket.io server");
  });

  socket.on("disconnect", () => {
    console.log("✗ Disconnected from Socket.io server");
  });

  socket.on("error", (error) => {
    console.error("✗ Socket connection error:", error);
  });

  socket.on("reconnect", (attempt) => {
  console.log("🔄 Reconnected after", attempt, "attempts");
  });

  return socket;
};

export const getSocket = () => socket;