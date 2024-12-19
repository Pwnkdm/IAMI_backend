require("dotenv").config();
const mongoose = require("mongoose");
const URI = process.env.DB_URL;
const connectDb = async()=>{
    try {
        await mongoose.connect(URI);
    } catch (error) {
        process.exit(0);
    }
}
module.exports = connectDb;