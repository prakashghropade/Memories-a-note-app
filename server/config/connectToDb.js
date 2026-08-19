import mongoose from "mongoose";
import logger from "../helpers/logger.js";

async function connectToDb(){
    try {
        await mongoose.connect(process.env.DB_URL)
        logger.info("database_connected", {
            database: mongoose.connection.name,
            host: mongoose.connection.host,
        });
    } catch (error) {
        logger.error("database_connection_failed", {
            error: error.message,
        });
    }
}

export default connectToDb;