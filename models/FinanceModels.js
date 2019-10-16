const mongoose = require("mongoose"),
      Schema = mongoose.Schema;

const budgetSchema = new Schema({
    quantity: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

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
    cateogry: {
        type: String,
        required: true
    }
});

const Budget = mongoose.model('budget', budgetSchema);
const Commitment = mongoose.model('commitment', commitmentSchema);

module.exports = {
    Budget,
    Commitment
};
