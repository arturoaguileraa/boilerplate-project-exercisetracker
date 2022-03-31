const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        default: 0,
    },
    log: {
        type: [Object],
    },
});

const exerciseSchema = new Schema({
    userID: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = {
    User: mongoose.model("User", userSchema),
    Exercise: mongoose.model("Exercise", exerciseSchema),
};
