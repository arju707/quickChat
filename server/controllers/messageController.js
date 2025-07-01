

// get all user except loged user 

import Message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../library/cloudinary.js"
import { io, userSocketMap } from "../server.js";
export const  getUsersForSidebar = async (req, res)=>{
    try {
        
        const userId = req.user._id;
        const filterdUsers = await User.find({_id: {$ne: userId}}).select("-password");

        //count number of message not seen 

        const unseenMessages = {}

        const promises = filterdUsers.map(async(user)=>{
            const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false})

            if(messages.length>0){
                unseenMessages[user._id] = messages.length
            }
        })

        await Promise.all(promises);
        res.json({success: true, users: filterdUsers, unseenMessages})

    } catch (error) {
        console.log(error.message);
         res.json({success: false, message:error.message})
        
        
    }
}

//get message for selected user 

export  const getMessges = async (req, res)=>{
    try {

        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                                {senderId: selectedUserId, receiverId: myId},

            ]
        })

        await Message.updateMany({senderId: selectedUserId, receiverId: myId},{seen:true});

        res.json({success: true, messages})
        
    } catch (error) {

        console.log(error.message);
         res.json({success: false, message:error.message})

        
    }
}


//api to mark message seen using id 


export const markMessageAsSeen = async (req, res)=>{

    try {
        const {id}= req.params;
        await Message.findByIdAndUpdate(id, {seen: true})
        res.json({success: true})
        
    } catch (error) {
         console.log(error.message);
         res.json({success: false, message:error.message})
        
    }

}

//send message to selected user

export const sendMessage = async (req, res )=>{
     try {

        const {text, image} = req.body;
        const receiverId = req.params.id;
        const senderId= req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl =  uploadResponse.secure_url;  

        }
        

        const newMessage = Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        //emit the new message to the recevers socket 

        const reciverSocketId = userSocketMap[receiverId];
        
        if(reciverSocketId){
            io.to(reciverSocketId).emit("newMessage",newMessage)
        }


        res.json({success: true, newMessage})
     } catch (error) {
        console.log(error.message);
         res.json({success: false, message:error.message})
        
     }
}