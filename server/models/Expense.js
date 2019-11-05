const mongoose = require("mongoose"),
      Schema = mongoose.Schema;

const expenseSchema = new Schema({
    created: {
        type: Date,
        default: Date.now()
    },
    quantity: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String,
        default: "Undefined"
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const required = {
    name: {
        type: "String",
        required: "required"
    },
    quantity: {
        type: "Number",
        required: "required"
    },
    category: {
        type: "String",
        required: "optional"
    },
    description: {
        type: "String",
        required: "optional"
    },
    effective: {
        from: {
            type: Date,
            default: "When inserted"
        }
    }
}


const Expense = mongoose.model('expense', expenseSchema);

module.exports = {
    Expense
};
