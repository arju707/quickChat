import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./library/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server as SocketIOServer } from "socket.io";



//express 

const app = express();

const server = http.createServer(app)

//inetialize socket.io server
export const io = new SocketIOServer(server, {
    cors: {origin: "*"}
})

//store online users
export const userSocketMap = {}; //isere id  & socket id 

//socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("user Connected ", userId);

    if(userId) userSocketMap[userId] = socket.id;

    //emit online usetrs to all connect ones 

    io.emit("getOnlineUsers ",Object.keys(userSocketMap));


    socket.on("disconnect", ()=>{
        console.log("user disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })

})

//middlewares

app.use(express.json({limit:"4mb"}));

app.use(cors());


//routes Setup 

app.use("/api/status",(req, res )=>res.send("server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages",messageRouter)

//connect MOngodb

await connectDB()







const PORT = process.env.PORT || 5000;

server.listen(PORT, ()=>console.log("server is running on port : " +PORT));

