const mongoose = require("mongoose"),
      Schema = mongoose.Schema;

const expenseSchema = new Schema({
    quantity: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Expense = mongoose.model('expense', expenseSchema);

module.exports = {
    Expense
};
