import mongoose from "mongoose";

 //dbconnection

 export const connectDB = async () =>{
    try {

        mongoose.connection.on('connected', ()=>console.log('Database Connected'))

        await mongoose.connect(`${process.env.MONGODB_URI}/Quick-Chat`)

    } catch (error) {

        console.log(error);
        
    }
 }