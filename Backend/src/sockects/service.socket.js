import { Server } from "socket.io";

let io;

export function initialSocket(httpServer){
  io = new Server(httpServer,{
    cors:{
      origin:"http://localhost:5173",
      credentials:true
    }
  })

  console.log("✓ Socket.io server is running on port");
  
  io.on("connection",(socket)=>{  
    console.log("✓ A user connected:", socket.id);
    
    socket.on("disconnect", () => {
      console.log("✗ User disconnected:", socket.id);
    });

    socket.on("error", (error) => {
      console.error("✗ Socket error:", error);
    });
  });

  io.on("error", (error) => {
    console.error("✗ Socket.io server error:", error);
  });
}
export function GetIO(){
  if(!io){
    throw new Error("Socket.io not initilized")
  }

  return io
}