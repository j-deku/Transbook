import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async() =>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Db connected successfully")
    }catch(error){
        console.error("Db connection failed");
        process.exit(1);
    }
};

