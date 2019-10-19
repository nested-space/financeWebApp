const mongoose = require("mongoose"),
      Schema = mongoose.Schema;

const commitmentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    dayOfMonth: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    }
});

const Commitment = mongoose.model('commitment', commitmentSchema);

module.exports = {
    Commitment
};
