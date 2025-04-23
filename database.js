
const mongoose = require("mongoose");

require('dotenv').config();

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser:true,
            useUnifiedtopology:true
        })
        console.log("Database is connect");
        
        
    }catch (error){
        console.log(error);
        console.log("An error occured");
        
        
    }
};
module.exports = connectDB;