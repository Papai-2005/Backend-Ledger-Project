const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required to add to blacklist"],
        unique: [true, "Token already exists in blacklist"]
    }
}, {
    timestamps: true
});


tokenBlacklistSchema.index({createdAt: 1}, {expireAfterSeconds: 60*60*24*3}); // Expire after 3 days


const tokenBlacklistModel = mongoose.model("tokenBlacklist", tokenBlacklistSchema);

module.exports = tokenBlacklistModel;