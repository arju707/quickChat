import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./library/db.js";


//express 

const app = express();

const server = http.createServer(app)

//middlewares

app.use(express.json({limit:"4mb"}));

app.use(cors());

app.use("/api/status",(req, res )=>res.send("seerver is live"));

//connect MOngodb

await connectDB()







const PORT = process.env.PORT || 5000;

server.listen(PORT, ()=>console.log("server is running on port : " +PORT));

