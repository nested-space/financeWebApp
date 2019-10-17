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

const Budget = mongoose.model('budget', budgetSchema);

module.exports = {
    Budget
};
