const mongoose = require("mongoose");

const database = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDb atlash  conected successfully🔹");
    } catch (error) {
        console.error("database conection failed",error.message);
        process.exit(1);
    }
};

module.exports = database;
