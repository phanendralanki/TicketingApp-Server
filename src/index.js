import dotenv from "dotenv";
dotenv.config({
    path:'./.env.test'
});

import { app } from "./app.js";
import connectDB from "./db/connection.js";

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 6000,()=>{
        console.log(`Server is running at port: ${process.env.PORT} `);
    });
})
.catch((err)=>{
    console.log("Mongodb connection failed!!!",err);
});