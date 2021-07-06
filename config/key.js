const dotenv = require("dotenv");
dotenv.config();
module.exports = {
    MongoURI: process.env.MONGO_URI
}