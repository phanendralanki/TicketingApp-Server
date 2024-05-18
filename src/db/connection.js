import mongoose from 'mongoose';
import {DB_NAME} from "../constants.js";

const connectDB = async() => {
    try{

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`\n MongoDB Connected !! DB Host: ${connectionInstance.connection.host}`);
         //.host - to know for which host our db is connected, useful for differentiate dev and production db's.

    }catch(error){
        console.log("MONGODB Connection error ",error);
        process.exit(1);
    }
}

export default connectDB;